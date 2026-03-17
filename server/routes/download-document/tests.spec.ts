import { test, expect } from '@playwright/test'
import { stubComponents } from '../../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../../integration_tests/testUtils'
import { DownloadDocumentPage } from './test.page'
import {
  stubDownloadDocument,
  stubGetTemplateDetail,
  stubGetTemplateGroups,
  stubGetTemplates,
  stubPutTemplate,
} from '../../../integration_tests/mockApis/documentGenerationApi'
import { testPrisonerDetails, testTemplateDetail } from '../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../integration_tests/mockApis/prisonerSearchApi'
import { getApiBody } from '../../../integration_tests/mockApis/wiremock'

test.describe('/download-document not authorised', () => {
  test('should show not authorised if user does not have the required role for the template', async ({ page }) => {
    await Promise.all([stubComponents(), stubGetTemplateGroups(), stubGetTemplateDetail()])
    await login(page, { name: 'User without template group role', roles: ['ROLE_DOCUMENT_GENERATION_RW'] })
    await page.goto(`/download-document/${testTemplateDetail.id}`)
    await expect(page.getByRole('heading', { name: 'You do not have permission to access this page' })).toBeVisible()
    await resetStubs()
  })
})

test.describe('/download-document', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      stubComponents(),
      stubGetTemplateGroups(),
      stubGetTemplates(),
      stubGetTemplateDetail({ ...testTemplateDetail, instructionText: 'Sample instruction text' }),
      stubPutTemplate(),
      stubGetPrisonerDetails(),
      stubDownloadDocument(testTemplateDetail.id),
    ])
    await login(page, { name: 'A TestUser' })
    await page.goto(`/download-document/${testTemplateDetail.id}?prisonNumber=${testPrisonerDetails.prisonerNumber}`)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should render Create a document form', async ({ page }) => {
    // render content correctly
    const testPage = await new DownloadDocumentPage(page).verifyContent(testTemplateDetail.name)
    await expect(testPage.submitButton()).toBeVisible()
    await testPage.verifyAnswer('Full name', 'Prisoner-Name Prisoner-Surname')
    await expect(page.getByText('Sample instruction text')).toBeVisible()

    // validate input form
    await testPage.textbox('Temporary absence commences on').fill('<invalid input>')
    await testPage.submitButton().click()
    await testPage
      .link(
        'Temporary absence commences on (Absence information) only accepts alphanumeric characters, space and the following symbols: £ % = , . : " \' & # @ ? ( ) + - / \\ _',
      )
      .click()
    await expect(testPage.textbox('Temporary absence commences on')).toBeFocused()

    // test download document
    await testPage.textbox('Temporary absence commences on').fill('1/1/2001')
    await testPage.submitButton().click()

    const request = (await getApiBody(`/document-generation-api/templates/${testTemplateDetail.id}/document`))[0]
    expect(request).toContain('"filename":"TMPL_1_A9965EA_USER1_2026-')
    expect(request).toContain('"perName":"Prisoner-Name Prisoner-Surname"')
    expect(request).toContain('"TEMPORARY_ABSENCE__START_DATE":"1/1/2001"')
  })
})
