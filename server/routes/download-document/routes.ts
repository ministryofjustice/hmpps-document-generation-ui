import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { DownloadDocumentController } from './controller'
import { Page } from '../../services/auditService'
import { validate } from '../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const DownloadDocumentRoutes = (services: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new DownloadDocumentController(services)

  get('/', Page.DOWNLOAD_DOCUMENT, controller.GET)
  post('/', validate(schemaFactory(services)), controller.POST)

  return router
}
