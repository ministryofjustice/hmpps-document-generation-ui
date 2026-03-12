import { NextFunction, Request, Response } from 'express'
import DocumentGenerationService from '../../services/apis/documentGenerationService'
import { SchemaType } from './schema'
import { FLASH_KEY__SUCCESS_BANNER } from '../../utils/constants'

export class EditTemplateController {
  constructor(readonly documentGenerationService: DocumentGenerationService) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    const template = req.middleware!.template!
    const groups = req.middleware!.groups!
    const supportedVariables = req.middleware!.supportedVariables!

    res.locals.breadcrumbs.addItems({
      text: 'Document generation',
      alias: 'HOMEPAGE',
      href: `/?group=${template.groups[0]?.code ?? groups[0]!.code}`,
    })

    res.render('edit-template/view', {
      showBreadcrumbs: true,
      groups: groups.map(({ code: value, name: text }) => ({ text, value })),
      variableOptions: supportedVariables.map(domain => ({
        ...domain,
        variables: domain.variables.map(({ code: value, description: text }) => ({ text, value })),
      })),
      group: res.locals.formResponses?.['group'] ?? template.groups[0]?.code ?? groups[0]!.code,
      code: res.locals.formResponses?.['code'] ?? template.code,
      name: res.locals.formResponses?.['name'] ?? template.name,
      description: res.locals.formResponses?.['description'] ?? template.description,
      instructionText: res.locals.formResponses?.['instructionText'] ?? template.instructionText,
      variables:
        res.locals.formResponses?.['variables'] ||
        template.variables.domains.flatMap(domain => domain.variables.map(variable => variable.code)),
    })
  }

  submitToApi = async (req: Request<{ id: string }, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      await this.documentGenerationService.editTemplate(
        { res },
        {
          id: req.params.id,
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
    req.flash(FLASH_KEY__SUCCESS_BANNER, `Template “${req.body.name}” has been updated`)
    res.redirect(`/?group=${req.body.group}`)
  }
}
