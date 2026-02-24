import { Router } from 'express'

import type { Services } from '../services'
import { HomepageController } from './controller'
import { BaseRouter } from './common/routes'
import { Page } from '../services/auditService'
import breadcrumbs from '../middleware/breadcrumbs'

export default function routes({ documentGenerationService }: Services): Router {
  const { router, get } = BaseRouter()
  const controller = new HomepageController(documentGenerationService)

  router.use(breadcrumbs())

  get('/', Page.HOMEPAGE, controller.GET)

  return router
}
