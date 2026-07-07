import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { dataAccess } from '../data'
import AuditService from './auditService'
import PrisonerSearchApiService from './apis/prisonerSearchService'
import config from '../config'
import logger from '../../logger'
import DocumentGenerationService from './apis/documentGenerationService'
import PrisonRegisterService from './apis/prisonRegisterService'
import ExternalMovementsService from './apis/externalMovementsService'
import PrisonApiService from './apis/prisonApiService'
import { telemetryWrapper } from '../utils/telemetryWrapper'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient } = dataAccess()

  const prisonPermissionsService = PermissionsService.create({
    prisonerSearchConfig: config.apis.prisonerSearchApi,
    authenticationClient: hmppsAuthClient,
    logger,
    // @ts-expect-error cast hmpps-azure-telemetry into applicationinsight telemetry
    telemetryClient: telemetryWrapper(),
  })

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    prisonerSearchService: new PrisonerSearchApiService(hmppsAuthClient, prisonPermissionsService),
    prisonRegisterService: new PrisonRegisterService(hmppsAuthClient),
    documentGenerationService: new DocumentGenerationService(hmppsAuthClient),
    externalMovementsService: new ExternalMovementsService(hmppsAuthClient),
    prisonApiService: new PrisonApiService(hmppsAuthClient),
  }
}

export type Services = ReturnType<typeof services>
