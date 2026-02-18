import express from 'express'

import createError from 'http-errors'

import { getFrontendComponents } from '@ministryofjustice/hmpps-connect-dps-components'
import * as Sentry from '@sentry/node'
import './sentry'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes from './routes'
import type { Services } from './services'
import logger from '../logger'
import config from './config'
import { AuthorisedRoles } from './middleware/permissions/authorisedRoles'
import sentryMiddleware from './middleware/sentryMiddleware'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(sentryMiddleware())
  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication())

  app.get(
    '/auth-error',
    getFrontendComponents({
      logger,
      requestOptions: { includeSharedData: true },
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
    (_req, res) => {
      res.status(401)
      return res.render('autherror')
    },
  )

  app.use(authorisationMiddleware([AuthorisedRoles.DOCUMENT_GENERATION_RW]))
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())

  app.get(
    /(.*)/,
    getFrontendComponents({
      logger,
      requestOptions: { includeSharedData: true },
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
  )

  app.use(routes(services))
  app.get('/test-error', (_req, _res) => {
    throw new Error('sentry test')
  })

  if (config.sentry.dsn) Sentry.setupExpressErrorHandler(app)

  app.use((_req, _res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
