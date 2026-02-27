import { stubFor, successStub } from './wiremock'
import { components } from '../../server/@types/documentGeneration'
import { testGroups, testTemplates, testVariables } from '../data/testData'

export const stubDocumentGenerationPing = (httpStatus = 200) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/document-generation-api/health/ping',
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export const stubGetTemplateGroups = (response: components['schemas']['TemplateGroups'] = testGroups) =>
  successStub({
    method: 'GET',
    url: '/document-generation-api/groups',
    response,
  })

export const stubGetTemplates = (response: components['schemas']['TemplateGroupTemplates'] = testTemplates) =>
  successStub({
    method: 'GET',
    url: `/document-generation-api/groups/${response.group.code}`,
    response,
  })

export const stubGetVariables = (response: components['schemas']['TemplateVariables'] = testVariables) =>
  successStub({
    method: 'GET',
    url: '/document-generation-api/variables',
    response,
  })
