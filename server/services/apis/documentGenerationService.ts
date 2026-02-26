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

  async getGroupings(_context: ApiRequestContext) {
    // TODO: implement actual API call

    return {
      groupings: [
        {
          code: 'EXTERNAL_MOVEMENT',
          name: 'External movement templates',
          description:
            'Document templates associated with external movements in general. These require a person to be selected',
        },
        {
          code: 'TEMPORARY_ABSENCE',
          name: 'Temporary absence templates',
          description:
            'Document templates associated with temporary absences. These require a person and a temporary absence to be selected',
        },
      ],
    }
  }

  async getTemplatesForGrouping(_context: ApiRequestContext, _grouping: string) {
    // TODO: implement actual API call

    return {
      grouping: {
        code: 'EXTERNAL_MOVEMENT',
        name: 'External movement templates',
        description:
          'Document templates associated with external movements in general. These require a person to be selected',
      },
      templates: [
        {
          code: 'ROTL_LIC1',
          name: 'ROTL 18 licence document',
          description: 'ROTL licence',
        },
        {
          code: 'LISP_3',
          name: 'LISP 3',
          description: 'ROTL licence',
        },
      ],
    }
  }

  async getTemplateVariables(context: ApiRequestContext) {
    return this.apiClient.withContext(context).get<components['schemas']['TemplateVariables']>({ path: '/variables ' })
  }
}
