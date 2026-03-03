import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { Agency } from './model/agency'

export default class PrisonRegisterService {
  private apiClient: CustomRestClient

  constructor(authenticationClient: AuthenticationClient) {
    this.apiClient = new CustomRestClient(
      'Prison Register API',
      config.apis.prisonRegisterApi,
      logger,
      authenticationClient,
      false,
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

  async getPrisonDetails(context: ApiRequestContext, prisonId: string): Promise<Agency> {
    return this.apiClient.withContext(context).get<Agency>({ path: `/prisons/id/${prisonId}` })
  }
}
