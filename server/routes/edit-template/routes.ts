import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { EditTemplateController } from './controller'
import { Page } from '../../services/auditService'
import { overrideTimeoutMiddleware } from '../../middleware/overrideTimeoutMiddleware'
import { validate } from '../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const EditTemplateRoutes = ({ documentGenerationService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTemplateController(documentGenerationService)

  get('/', Page.EDIT_TEMPLATE, controller.GET)
  post(
    '/',
    overrideTimeoutMiddleware(2 * 60),
    validate(schemaFactory(documentGenerationService)),
    controller.submitToApi,
    controller.POST,
  )

  return router
}
