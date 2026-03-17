import { stubFor, successStub } from './wiremock'
import { components } from '../../server/@types/documentGeneration'
import { testGroups, testTemplateDetail, testTemplates, testVariables } from '../data/testData'

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

export const stubGetTemplateVariables = (response: components['schemas']['TemplateVariables'] = testVariables) =>
  successStub({
    method: 'GET',
    url: '/document-generation-api/variables',
    response,
  })

export const stubGetTemplates = (response: components['schemas']['TemplateGroupTemplates'] = testTemplates) =>
  successStub({
    method: 'GET',
    url: `/document-generation-api/groups/${response.group.code}`,
    response,
  })

export const stubPutTemplate = (response: components['schemas']['TemplateResponse'] = { id: 'new-template-id' }) =>
  successStub({
    method: 'PUT',
    url: `/document-generation-api/templates`,
    response,
  })

export const stubGetTemplateDetail = (response: components['schemas']['TemplateDetail'] = testTemplateDetail) =>
  successStub({
    method: 'GET',
    url: `/document-generation-api/templates/${response.id}`,
    response,
  })

export const stubDownloadDocument = (templateId: string) =>
  stubFor({
    request: {
      method: 'POST',
      url: `/document-generation-api/templates/${templateId}/document`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/msword' },
      body: 'TEXT',
    },
  })
