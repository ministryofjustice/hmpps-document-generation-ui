import { Request, Response } from 'express'
import DocumentGenerationService from '../../services/apis/documentGenerationService'

export class GenerateDocumentController {
  constructor(readonly documentGenerationService: DocumentGenerationService) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    const [template, groups] = await Promise.all([
      this.documentGenerationService.getTemplateById({ res }, req.params.id),
      this.documentGenerationService.getGroups({ res }).then(result => result.groups),
    ])

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
      prisonDomain: template.variables.domains.find(({ code }) => code === 'PRISON'),
      prisonerDomain: template.variables.domains.find(({ code }) => code === 'PERSON'),
      otherDomains: template.variables.domains.filter(({ code }) => code !== 'PRISON' && code !== 'PERSON'),
    })
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(req.originalUrl)
  }
}
