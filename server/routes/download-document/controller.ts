import { Request, Response } from 'express'
import { format } from 'date-fns'
import { Services } from '../../services'
import { FLASH_KEY__FORM_RESPONSES } from '../../utils/constants'
import { GenerateDocumentQuery, mapTemplateVariables } from './utils'
import { permittedRedirect } from '../../utils/permittedRedirect'
import logger from '../../../logger'

export class DownloadDocumentController {
  constructor(readonly services: Services) {}

  GET = async (
    req: Request<{ id: string }, unknown, unknown, GenerateDocumentQuery & { returnTo?: string }>,
    res: Response,
  ) => {
    const [template, groups] = await Promise.all([
      this.services.documentGenerationService.getTemplateById({ res }, req.params.id),
      this.services.documentGenerationService.getGroups({ res }).then(result => result.groups),
    ])

    const returnTo = permittedRedirect(req.query.returnTo)

    const homeUrl = `/?group=${template.groups[0]?.code ?? groups[0]!.code}`
    const variables = res.locals.formResponses ?? (await mapTemplateVariables(this.services, { res }, req.query))

    res.render('download-document/view', {
      backUrl: returnTo ?? `/generate-document/${req.params.id}?${new URLSearchParams(req.query).toString()}`,
      homeUrl,
      returnTo,
      template,
      variables,
    })
  }

  POST = async (
    req: Request<{ id: string }, unknown, { [key: string]: string | undefined }, GenerateDocumentQuery>,
    res: Response,
  ) => {
    req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify(req.body))
    if (req.body['reload'] !== undefined) {
      res.redirect(req.originalUrl)
    } else {
      const template = await this.services.documentGenerationService.getTemplateById({ res }, req.params.id)

      let image: { buffer: Buffer; originalname: string } | null = null
      if (req.body['perImage']) {
        try {
          const buffer = await this.services.prisonApiService.getPrisonerImageAsBuffer({ res }, req.body['perImage'])
          image = { buffer, originalname: `${req.body['perImage']}.png` }
        } catch (error) {
          logger.warn(error, `Unable to get image for Prison number ${req.body['perImage']}`)
        }
      }

      let filename = template.code
      if (req.query.prisonNumber) filename = `${filename}_${req.query.prisonNumber}`
      filename = `${filename}_${res.locals.user.username}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.docx`

      const document = await this.services.documentGenerationService.generateDocument(
        { res },
        req.params.id,
        filename,
        req.body,
        image,
      )

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(document)
    }
  }
}
