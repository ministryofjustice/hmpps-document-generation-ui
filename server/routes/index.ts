import { Router } from 'express'

import type { Services } from '../services'
import { HomepageController } from './controller'
import { BaseRouter } from './common/routes'
import { Page } from '../services/auditService'
import breadcrumbs from '../middleware/breadcrumbs'
import { AddTemplateRoutes } from './add-template/routes'
import populateValidationErrors from '../middleware/validation/populateValidationErrors'
import { FLASH_KEY__SUCCESS_BANNER } from '../utils/constants'

export default function routes(services: Services): Router {
  const { router, get } = BaseRouter()
  const controller = new HomepageController(services.documentGenerationService)

  router.use(breadcrumbs())

  get('*any', populateValidationErrors())
  get('*any', (req, res, next) => {
    const successBanner = req.flash(FLASH_KEY__SUCCESS_BANNER)
    res.locals['successBanner'] = successBanner?.[0] ? successBanner[0] : undefined
    next()
  })

  get('/', Page.HOMEPAGE, controller.GET)

  router.use('/add-template', AddTemplateRoutes(services))

  return router
}
