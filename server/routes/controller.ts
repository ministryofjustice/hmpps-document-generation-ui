import { Request, Response } from 'express'
import DocumentGenerationService from '../services/apis/documentGenerationService'

export class HomepageController {
  constructor(readonly documentGenerationService: DocumentGenerationService) {}

  GET = async (req: Request, res: Response) => {
    const { groupings } = await this.documentGenerationService.getGroupings({ res })

    const activeGroupingCode = groupings.find(itm => itm.code === req.query['grouping'])?.code ?? groupings[0]!.code

    const { templates } = await this.documentGenerationService.getTemplatesForGrouping({ res }, activeGroupingCode)

    res.render('view', {
      showBreadcrumbs: true,
      groupings,
      activeGroupingCode,
      templates,
    })
  }
}
