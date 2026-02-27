import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { AddTemplateController } from './controller'
import { Page } from '../../services/auditService'
import { overrideTimeoutMiddleware } from '../../middleware/overrideTimeoutMiddleware'
import { validate } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const AddTemplateRoutes = ({ documentGenerationService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new AddTemplateController(documentGenerationService)

  get('/', Page.ADD_TEMPLATE, controller.GET)
  post('/', overrideTimeoutMiddleware(2 * 60), validate(schema), controller.submitToApi, controller.POST)

  return router
}
