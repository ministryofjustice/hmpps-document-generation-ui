import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { Services } from '../../services'

export const schemaFactory =
  ({ documentGenerationService, prisonerSearchService, prisonApiService }: Services) =>
  async (req: Request, res: Response) => {
    const props: { [key: string]: z.ZodTypeAny } = {}

    const template = await documentGenerationService.getTemplateById({ res }, req.params['id'] as string)

    if (template.variables.domains.find(({ code }) => code === 'PRISON')) {
      props['prison'] = z
        .string()
        .min(1, { message: 'Enter a prison ID' })
        .transform(val => val.trim())
        .transform(async (val, ctx) => {
          try {
            return await prisonApiService.getPrisonDetails({ res }, val)
          } catch {
            ctx.addIssue({
              code: 'custom',
              message: `Cannot read prison details for “${val}”`,
            })
            return z.NEVER
          }
        })
    }
    if (template.variables.domains.find(({ code }) => code === 'PERSON')) {
      props['prisoner'] = z
        .string()
        .min(1, { message: 'Enter a prison number' })
        .regex(/^\s*[a-zA-Z][0-9]{4}[a-zA-Z]{2}\s*$/, {
          message: 'Enter a valid prison number in the format A1234CD',
        })
        .transform(val => val.trim())
        .transform(async (val, ctx) => {
          try {
            const prisoner = await prisonerSearchService.getPrisonerDetails({ res }, val)

            if (!prisoner) {
              ctx.addIssue({
                code: 'custom',
                message: `Cannot read prisoner details for “${val}”`,
              })
              return z.NEVER
            }

            return prisoner
          } catch {
            ctx.addIssue({
              code: 'custom',
              message: `Cannot read prisoner details for “${val}”`,
            })
            return z.NEVER
          }
        })
    }

    for (const domain of template.variables.domains.filter(({ code }) => code !== 'PRISON' && code !== 'PERSON')) {
      for (const variable of domain.variables) {
        props[variable.code] = z.string().min(1, { message: `Enter ${domain.description} - ${variable.description}` })
      }
    }

    return createSchema(props)
  }
