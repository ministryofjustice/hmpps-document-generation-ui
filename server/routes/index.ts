import { Router } from 'express'

import type { Services } from '../services'
import { HomepageController } from './controller'
import { BaseRouter } from './common/routes'
import { Page } from '../services/auditService'
import breadcrumbs from '../middleware/breadcrumbs'
import { AddTemplateRoutes } from './add-template/routes'
import populateValidationErrors from '../middleware/validation/populateValidationErrors'
import { FLASH_KEY__SUCCESS_BANNER } from '../utils/constants'
import { EditTemplateRoutes } from './edit-template/routes'
import { GenerateDocumentRoutes } from './generate-document/routes'
import { DownloadDocumentRoutes } from './download-document/routes'
import { populateTemplateConfig } from '../middleware/permissions/populateTemplateConfig'

export default function routes(services: Services): Router {
  const { router, get } = BaseRouter()

  const { documentGenerationService } = services

  const controller = new HomepageController(documentGenerationService)

  router.use(breadcrumbs())

  get('*any', populateValidationErrors())
  get('*any', (req, res, next) => {
    const successBanner = req.flash(FLASH_KEY__SUCCESS_BANNER)
    res.locals['successBanner'] = successBanner?.[0] ? successBanner[0] : undefined
    next()
  })

  get('/', Page.HOMEPAGE, populateTemplateConfig(documentGenerationService, {}), controller.GET)

  router.use(
    '/add-template',
    populateTemplateConfig(documentGenerationService, { getVariables: true }),
    AddTemplateRoutes(services),
  )
  router.use(
    '/edit-template/:id',
    populateTemplateConfig(documentGenerationService, { getVariables: true, getTemplate: true }),
    EditTemplateRoutes(services),
  )
  router.use(
    '/generate-document/:id',
    populateTemplateConfig(documentGenerationService, { getTemplate: true }),
    GenerateDocumentRoutes(services),
  )
  router.use(
    '/download-document/:id',
    populateTemplateConfig(documentGenerationService, { getTemplate: true, requireAdminRole: false }),
    DownloadDocumentRoutes(services),
  )

  return router
}
