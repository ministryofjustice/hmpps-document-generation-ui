import { Request, Response } from 'express'
import { format } from 'date-fns'
import { Services } from '../../services'
import { GenerateDocumentQuery, getReadOnlyVariables, mapTemplateVariables } from './utils'
import { permittedRedirect } from '../../utils/permittedRedirect'
import logger from '../../../logger'

export class DownloadDocumentController {
  constructor(readonly services: Services) {}

  GET = async (
    req: Request<{ id: string }, unknown, unknown, GenerateDocumentQuery & { returnTo?: string; backTo?: string }>,
    res: Response,
  ) => {
    const template = req.middleware!.template!
    const groups = req.middleware!.groups!

    const returnTo = permittedRedirect(req.query.returnTo)
    const backTo = permittedRedirect(req.query.backTo)

    const homeUrl = `/?group=${template.groups[0]?.code ?? groups[0]!.code}`
    const variables = res.locals.formResponses ?? (await mapTemplateVariables(this.services, { res }, req.query))
    const { prisonDetails, prisonerDetails } = getReadOnlyVariables(template)

    const hasInputFields =
      template.variables.domains.find(({ code }) => !['PRISON', 'PERSON'].includes(code)) ||
      template.variables.domains
        .find(({ code }) => code === 'PRISON')
        ?.variables.find(({ code }) => code === 'prsnPhone' || code === 'prsnEmailFax')

    res.render('download-document/view', {
      backUrl: backTo?.url ?? `/generate-document/${req.params.id}?${new URLSearchParams(req.query).toString()}`,
      homeUrl,
      returnTo,
      template,
      variables,
      prisonDetails,
      prisonerDetails,
      hasInputFields,
    })
  }

  POST = async (
    req: Request<{ id: string }, unknown, { [key: string]: string | undefined }, GenerateDocumentQuery>,
    res: Response,
  ) => {
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

    const { perImage, _csrf, download, ...variables } = req.body

    const document = await this.services.documentGenerationService.generateDocument(
      { res },
      req.params.id,
      filename,
      variables,
      image,
    )

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(document)
  }
}
