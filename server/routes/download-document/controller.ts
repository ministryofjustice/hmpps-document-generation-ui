import { Request, Response } from 'express'
import { Services } from '../../services'
import { FLASH_KEY__FORM_RESPONSES } from '../../utils/constants'
import { GenerateDocumentQuery, mapTemplateVariables } from './utils'

export class DownloadDocumentController {
  constructor(readonly services: Services) {}

  GET = async (req: Request<{ id: string }, unknown, unknown, GenerateDocumentQuery>, res: Response) => {
    const template = await this.services.documentGenerationService.getTemplateById({ res }, req.params.id)

    res.render('download-document/view', {
      backUrl: `/generate-document/${req.params.id}?${new URLSearchParams(req.query).toString()}`,
      template,
      domains: template.variables.domains
        .sort((a, b) => a.description.localeCompare(b.description))
        .map(domain => ({
          ...domain,
          variables: domain.variables.sort((a, b) => a.description.localeCompare(b.description)),
        })),
      variables: res.locals.formResponses ?? (await mapTemplateVariables(this.services, { res }, req.query)),
    })
  }

  POST = async (req: Request, res: Response) => {
    req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify(req.body))
    res.redirect(req.originalUrl)
  }
}
