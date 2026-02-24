import { Router } from 'express'

import type { Services } from '../services'
import { HomepageController } from './controller'
import { BaseRouter } from './common/routes'
import { Page } from '../services/auditService'
import breadcrumbs from '../middleware/breadcrumbs'
import { AddTemplateRoutes } from './add-template/routes'
import populateValidationErrors from '../middleware/validation/populateValidationErrors'

export default function routes(services: Services): Router {
  const { router, get } = BaseRouter()
  const controller = new HomepageController(services.documentGenerationService)

  router.use(breadcrumbs())
  router.get('*any', populateValidationErrors())

  get('/', Page.HOMEPAGE, controller.GET)

  router.use('/add-template', AddTemplateRoutes(services))

  return router
}
