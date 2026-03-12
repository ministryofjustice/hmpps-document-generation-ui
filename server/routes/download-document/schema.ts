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

    for (const domain of template.variables.domains) {
      for (const variable of domain.variables) {
        props[variable.code] = z.string().regex(/^[\w\s£%=,.:"'&#@?()+\-/\\]*$/, {
          message: `${variable.description} (${domain.description}) only accepts alphanumeric characters, space and the following symbols: £ % = , . : " ' & # @ ? ( ) + - / \\ _`,
        })
      }
    }

    return createSchema(props)
  }
