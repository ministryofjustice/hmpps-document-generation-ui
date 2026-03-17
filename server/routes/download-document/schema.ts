import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { Services } from '../../services'

export const schemaFactory =
  ({ documentGenerationService }: Services) =>
  async (req: Request, res: Response) => {
    const props: { [key: string]: z.ZodTypeAny } = {
      download: z.string().optional(),
      reload: z.string().optional(),
    }

    const template = await documentGenerationService.getTemplateById({ res }, req.params['id'] as string)

    const timeVariableCodes: string[] = []

    for (const domain of template.variables.domains) {
      for (const variable of domain.variables) {
        if (variable.type === 'TIME') {
          timeVariableCodes.push(variable.code)

          props[`${variable.code}Hour`] = z
            .string()
            .regex(/^\d*$/, {
              message: `${variable.description} (${domain.description}) only accepts numeric characters`,
            })
            .transform(val => (val ? val.padStart(2, '0') : val))
          props[`${variable.code}Minute`] = z
            .string()
            .regex(/^\d*$/, {
              message: `${variable.description} (${domain.description}) only accepts numeric characters`,
            })
            .transform(val => (val ? val.padStart(2, '0') : val))
        } else if (variable.type === 'NUMBER') {
          props[variable.code] = z.string().regex(/^\d*$/, {
            message: `${variable.description} (${domain.description}) only accepts numeric characters`,
          })
        } else {
          props[variable.code] = z.string().regex(/^[\w\s£%=,.:"'&#@?()+\-/\\]*$/, {
            message: `${variable.description} (${domain.description}) only accepts alphanumeric characters, space and the following symbols: £ % = , . : " ' & # @ ? ( ) + - / \\ _`,
          })
        }
      }
    }

    if (timeVariableCodes) {
      return createSchema(props).transform(val => {
        const result = { ...val }
        for (const code of timeVariableCodes) {
          if (result[`${code}Hour`] || result[`${code}Minute`]) {
            result[code] = `${result[`${code}Hour`] ?? ''}:${result[`${code}Minute`] ?? ''}`
          }
          delete result[`${code}Hour`]
          delete result[`${code}Minute`]
        }
        return result
      })
    }

    return createSchema(props)
  }
