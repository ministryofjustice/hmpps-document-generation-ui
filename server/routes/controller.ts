import { Request, Response } from 'express'
import DocumentGenerationService from '../services/apis/documentGenerationService'

export class HomepageController {
  constructor(readonly documentGenerationService: DocumentGenerationService) {}

  GET = async (req: Request, res: Response) => {
    const { groups } = await this.documentGenerationService.getGroups({ res })

    const activeGroupCode = groups.find(itm => itm.code === req.query['group'])?.code ?? groups[0]!.code

    const { templates } = await this.documentGenerationService.getTemplatesForGroup({ res }, activeGroupCode)

    res.render('view', {
      showBreadcrumbs: true,
      groups,
      activeGroupCode,
      templates,
    })
  }
}
