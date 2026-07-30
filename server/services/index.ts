import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { dataAccess } from '../data'
import AuditService from './auditService'
import PrisonerSearchApiService from './apis/prisonerSearchService'
import config from '../config'
import logger from '../../logger'
import DocumentGenerationService from './apis/documentGenerationService'
import PrisonRegisterService from './apis/prisonRegisterService'
import ExternalMovementsService from './apis/externalMovementsService'
import PrisonApiService from './apis/prisonApiService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient } = dataAccess()

  const prisonPermissionsService = PermissionsService.create({
    prisonerSearchConfig: config.apis.prisonerSearchApi,
    authenticationClient: hmppsAuthClient,
    logger,
    telemetryClient: telemetry,
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
