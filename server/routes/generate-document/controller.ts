import { Request, Response } from 'express'
import DocumentGenerationService from '../../services/apis/documentGenerationService'
import { GenerateDocumentQuery } from '../download-document/utils'

export class GenerateDocumentController {
  constructor(readonly documentGenerationService: DocumentGenerationService) {}

  GET = async (req: Request<{ id: string }, unknown, unknown, GenerateDocumentQuery>, res: Response) => {
    const template = req.middleware!.template!
    const groups = req.middleware!.groups!

    const homeUrl = `/?group=${template.groups[0]?.code ?? groups[0]!.code}`

    res.locals.breadcrumbs.addItems({
      text: 'Document generation',
      alias: 'HOMEPAGE',
      href: homeUrl,
    })

    res.render('generate-document/view', {
      showBreadcrumbs: true,
      template,
      homeUrl,
      prison: res.locals.formResponses?.['prison'] ?? req.query.prisonId,
      prisoner: res.locals.formResponses?.['prisoner'] ?? req.query.prisonNumber,
      absenceId: res.locals.formResponses?.['absenceId'] ?? req.query.absenceId,
    })
  }

  POST = async (req: Request<{ id: string }>, res: Response) => {
    const query = new URLSearchParams({
      ...(req.body.prison ? { prisonId: req.body.prison } : {}),
      ...(req.body.prisoner ? { prisonNumber: req.body.prisoner } : {}),
      ...(req.body.absenceId ? { absenceId: req.body.absenceId } : {}),
    })

    res.redirect(`/download-document/${req.params.id}?${query.toString()}`)
  }
}
