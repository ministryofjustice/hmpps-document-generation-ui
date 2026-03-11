import { NextFunction, Request, Response } from 'express'
import DocumentGenerationService from '../../services/apis/documentGenerationService'
import { SchemaType } from './schema'
import { FLASH_KEY__SUCCESS_BANNER } from '../../utils/constants'

export class AddTemplateController {
  constructor(readonly documentGenerationService: DocumentGenerationService) {}

  GET = async (req: Request, res: Response) => {
    const [groups, supportedVariables] = await Promise.all([
      this.documentGenerationService.getGroups({ res }).then(result => result.groups),
      this.documentGenerationService.getTemplateVariables({ res }).then(result => result.domains),
    ])

    const activeGroupCode = groups.find(itm => itm.code === req.query['group'])?.code ?? groups[0]!.code

    res.locals.breadcrumbs.addItems({
      text: 'Document generation',
      alias: 'HOMEPAGE',
      href: `/?group=${activeGroupCode}`,
    })

    res.render('add-template/view', {
      showBreadcrumbs: true,
      groups: groups.map(({ code: value, name: text }) => ({ text, value })),
      variableOptions: supportedVariables.map(domain => ({
        ...domain,
        variables: domain.variables.map(({ code: value, description: text }) => ({ text, value })),
      })),
      group: res.locals.formResponses?.['group'] ?? activeGroupCode,
      code: res.locals.formResponses?.['code'],
      name: res.locals.formResponses?.['name'],
      description: res.locals.formResponses?.['description'],
      instructionText: res.locals.formResponses?.['instructionText'],
      variables: res.locals.formResponses?.['variables'],
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      await this.documentGenerationService.createTemplate(
        { res },
        {
          code: req.body.code,
          name: req.body.name,
          ...(req.body.description ? { description: req.body.description } : { description: '' }),
          ...(req.body.instructionText ? { instructionText: req.body.instructionText } : { instructionText: '' }),
          groups: [{ code: req.body.group }],
          variables: req.body.variables.map(itm => ({ code: itm, required: false })),
        },
        req.body.file,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.flash(FLASH_KEY__SUCCESS_BANNER, `A new template “${req.body.name}” has been created`)
    res.redirect(`/?group=${req.body.group}`)
  }
}
