import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { Services } from '../../services'
import { Agency } from '../../services/apis/model/agency'
import Prisoner from '../../services/apis/model/prisoner'
import { hasVariableDomain } from '../../utils/utils'
import { TemporaryAbsenceOccurrence } from '../../services/apis/model/temporaryAbsence'

export const schemaFactory =
  ({ documentGenerationService, prisonerSearchService, prisonRegisterService, externalMovementsService }: Services) =>
  async (req: Request, res: Response) => {
    const props: { [key: string]: z.ZodTypeAny } = {}

    const template = await documentGenerationService.getTemplateById({ res }, req.params['id'] as string)

    if (hasVariableDomain(template, 'PRISON')) {
      props['prison'] = z
        .string()
        .min(1, { message: 'Enter a prison ID' })
        .transform(val => val.trim())
        .check(async ctx => {
          let prison: Agency | undefined | null
          try {
            prison = await prisonRegisterService.getPrisonDetails({ res }, ctx.value)
          } catch {
            prison = null
          } finally {
            if (!prison) {
              ctx.issues.push({
                code: 'custom',
                message: `Cannot read prison details for “${ctx.value}”`,
                input: ctx.value,
              })
            }
          }
        })
    }
    if (hasVariableDomain(template, 'PERSON')) {
      props['prisoner'] = z
        .string()
        .min(1, { message: 'Enter a prison number' })
        .regex(/^\s*[a-zA-Z][0-9]{4}[a-zA-Z]{2}\s*$/, {
          message: 'Enter a valid prison number in the format A1234CD',
        })
        .transform(val => val.trim())
        .check(async ctx => {
          let prisoner: Prisoner | undefined | null
          try {
            prisoner = await prisonerSearchService.getPrisonerDetails({ res }, ctx.value)
          } catch {
            prisoner = null
          } finally {
            if (!prisoner) {
              ctx.issues.push({
                code: 'custom',
                message: `Cannot read prisoner details for “${ctx.value}”`,
                input: ctx.value,
              })
            }
          }
        })
    }
    if (hasVariableDomain(template, 'TEMPORARY_ABSENCE')) {
      props['absenceId'] = z
        .string()
        .min(1, { message: 'Enter a temporary absence plan ID' })
        .transform(val => val.trim())
        .check(async ctx => {
          if (
            res.locals.user.userRoles.includes('EXTERNAL_MOVEMENTS_TAP_RO') ||
            res.locals.user.userRoles.includes('EXTERNAL_MOVEMENTS_TAP_RW')
          ) {
            let absence: TemporaryAbsenceOccurrence | undefined | null
            try {
              absence = await externalMovementsService.getTapAuthorisationFirstOccurrence({ res }, ctx.value)
            } catch {
              absence = null
            } finally {
              if (!absence) {
                ctx.issues.push({
                  code: 'custom',
                  message: `Cannot read temporary absence details for “${ctx.value}”`,
                  input: ctx.value,
                })
              }
            }
          }
        })
    }

    return createSchema(props)
  }
