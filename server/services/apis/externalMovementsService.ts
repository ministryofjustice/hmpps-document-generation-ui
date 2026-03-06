import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { Response as SuperAgentResponse } from 'superagent'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { TemporaryAbsence } from './model/temporaryAbsence'

export default class ExternalMovementsService {
  private apiClient: CustomRestClient

  constructor(authenticationClient: AuthenticationClient) {
    this.apiClient = new CustomRestClient(
      'External Movements API',
      config.apis.externalMovementsApi,
      logger,
      authenticationClient,
      true,
      (retry?: boolean) => (err: Error, res: SuperAgentResponse) => {
        if (!retry) return false
        if (err) return true
        if (res?.statusCode) {
          return res.statusCode >= 500
        }
        return undefined
      },
    )
  }

  async getTapAuthorisation(context: ApiRequestContext, id: string) {
    const response = await this.apiClient.withContext(context).get<TemporaryAbsence>({
      path: `/temporary-absence-authorisations/${id}`,
    })

    if (!context.res.locals.user.caseLoads?.find(caseload => caseload.caseLoadId === response.prison.code)) {
      return null
    }

    return response
  }
}
