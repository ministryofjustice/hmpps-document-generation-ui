import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { Response as SuperAgentResponse } from 'superagent'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { components } from '../../@types/documentGeneration'

export default class DocumentGenerationService {
  private apiClient: CustomRestClient

  constructor(authenticationClient: AuthenticationClient) {
    this.apiClient = new CustomRestClient(
      'External Movements API',
      config.apis.documentGenerationApi,
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

  async createTemplate(
    context: ApiRequestContext,
    template: components['schemas']['TemplateRequest'],
    file: { buffer: Buffer; originalname: string },
  ) {
    return this.apiClient.withContext(context).put<components['schemas']['TemplateResponse']>({
      path: '/templates',
      multipartData: { template },
      files: { file },
    })
  }

  async editTemplate(
    context: ApiRequestContext,
    template: components['schemas']['TemplateRequest'],
    file: { buffer: Buffer; originalname: string } | null,
  ) {
    return this.apiClient.withContext(context).put<components['schemas']['TemplateResponse']>({
      path: '/templates',
      multipartData: { template },
      ...(file ? { files: { file } } : {}),
    })
  }

  async getTemplateById(context: ApiRequestContext, id: string) {
    return this.apiClient
      .withContext(context)
      .get<components['schemas']['TemplateDetail']>({ path: `/templates/${id}` })
  }

  async getGroups(context: ApiRequestContext) {
    return this.apiClient.withContext(context).get<components['schemas']['TemplateGroups']>({ path: '/groups ' })
  }

  async getTemplatesForGroup(context: ApiRequestContext, group: string) {
    return this.apiClient
      .withContext(context)
      .get<components['schemas']['TemplateGroupTemplates']>({ path: `/groups/${group} ` })
  }

  async getTemplateVariables(context: ApiRequestContext) {
    return this.apiClient.withContext(context).get<components['schemas']['TemplateVariables']>({ path: '/variables ' })
  }
}
