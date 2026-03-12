import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import DocumentGenerationService from '../../services/apis/documentGenerationService'

export const schemaFactory =
  (documentGenerationService: DocumentGenerationService) => async (req: Request, res: Response) =>
    createSchema({
      group: z.string().min(1, { message: 'Select a group' }),
      code: z
        .string()
        .min(1, { message: 'Enter a code' })
        .regex(/^\s*[A-Z0-9_]*\s*$/, {
          message: 'A template code must contain only uppercase letters, numbers and/or underscores',
        })
        .transform(val => val.trim())
        .check(async ctx => {
          if (
            (await documentGenerationService.getTemplatesForGroup({ res }, req.body.group)).templates.find(
              template => template.code === ctx.value,
            )
          ) {
            ctx.issues.push({
              code: 'custom',
              message: `Template code “${ctx.value}” is already in use`,
              input: ctx.value,
            })
          }
        }),
      name: z.string().min(1, { message: 'Enter a template name' }),
      description: z.string().transform(val => (val.trim().length ? val : null)),
      instructionText: z.string().transform(val => (val.trim().length ? val : null)),
      file: z
        .object()
        .optional()
        .transform((_val, ctx) => {
          if (req.middleware?.fileError) {
            ctx.addIssue({ code: 'custom', message: req.middleware.fileError })
            return z.NEVER
          }
          if (!req.file) {
            ctx.addIssue({ code: 'custom', message: 'You must select a file' })
            return z.NEVER
          }
          return req.file
        }),
      variables: z
        .union([z.string(), z.array(z.string())], { message: 'Select at least one template variable' })
        .transform(val => {
          if (!val) return []
          if (Array.isArray(val)) return val
          return [val]
        }),
    })

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
