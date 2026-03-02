import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { GenerateDocumentController } from './controller'
import { Page } from '../../services/auditService'
import { validate } from '../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const GenerateDocumentRoutes = (services: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new GenerateDocumentController(services.documentGenerationService)

  get('/', Page.GENERATE_DOCUMENT, controller.GET)
  post('/', validate(schemaFactory(services)), controller.POST)

  return router
}
