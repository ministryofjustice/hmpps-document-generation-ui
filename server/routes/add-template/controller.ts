import { Request, Response } from 'express'
import DocumentGenerationService from '../../services/apis/documentGenerationService'
import { SchemaType } from './schema'

export class AddTemplateController {
  constructor(readonly documentGenerationService: DocumentGenerationService) {}

  GET = async (req: Request, res: Response) => {
    const { groupings } = await this.documentGenerationService.getGroupings({ res })

    const activeGroupingCode = groupings.find(itm => itm.code === req.query['grouping'])?.code ?? groupings[0]!.code

    res.locals.breadcrumbs.addItems({
      text: 'Document generation',
      alias: 'HOMEPAGE',
      href: `/?grouping=${activeGroupingCode}`,
    })

    res.render('add-template/view', {
      showBreadcrumbs: true,
      groupings: groupings.map(({ code: value, name: text }) => ({ text, value })),
      group: res.locals.formResponses?.['group'] ?? activeGroupingCode,
      code: res.locals.formResponses?.['code'],
      name: res.locals.formResponses?.['name'],
      description: res.locals.formResponses?.['description'],
      prison: res.locals.formResponses?.['prison'],
      prisoner: res.locals.formResponses?.['prisoner'],
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    // TODO: Implement API call to create a template and success notification message

    res.redirect(`/?grouping=${req.body.group}`)
  }
}
