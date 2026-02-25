import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../middleware/validation/validationMiddleware'

export const schema = async (req: Request, _res: Response) =>
  createSchema({
    group: z.string().min(1, { message: 'Select a group' }),
    code: z.string().min(1, { message: 'Enter a code' }),
    name: z.string().min(1, { message: 'Enter a template name' }),
    description: z.string().transform(val => (val.trim().length ? val : null)),
    file: z.string().optional(),
    prison: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform(val => {
        if (!val) return []
        if (Array.isArray(val)) return val
        return [val]
      }),
    prisoner: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform(val => {
        if (!val) return []
        if (Array.isArray(val)) return val
        return [val]
      }),
  }).transform(async (val, ctx) => {
    if (!req.file) {
      ctx.addIssue({ code: 'custom', message: 'You must select a file', path: ['file'] })
      return z.NEVER
    }

    return {
      ...val,
      file: req.file,
    }
  })

export type SchemaType = z.infer<Awaited<ReturnType<typeof schema>>>
