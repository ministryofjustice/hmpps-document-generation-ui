import { test, expect } from '@playwright/test'
import { stubComponents } from '../../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../../integration_tests/testUtils'
import { EditTemplatePage } from './test.page'
import {
  stubGetTemplateDetail,
  stubGetTemplateGroups,
  stubGetTemplates,
  stubGetTemplateVariables,
  stubPutTemplate,
} from '../../../integration_tests/mockApis/documentGenerationApi'
import { DocumentGenerationHomepage } from '../test.page'
import { testTemplateDetail } from '../../../integration_tests/data/testData'

test.describe('/edit-template not authorised', () => {
  test('should show not authorised if user does not have the required role for the template', async ({ page }) => {
    await Promise.all([stubComponents(), stubGetTemplateGroups(), stubGetTemplateVariables(), stubGetTemplateDetail()])
    await login(page, { name: 'User without template group role', roles: ['ROLE_DOCUMENT_GENERATION_RW'] })
    await page.goto(`/edit-template/${testTemplateDetail.id}`)
    await expect(page.getByRole('heading', { name: 'You do not have permission to access this page' })).toBeVisible()
    await resetStubs()
  })
})

test.describe('/edit-template', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      stubComponents(),
      stubGetTemplateGroups(),
      stubGetTemplates(),
      stubGetTemplateVariables(),
      stubGetTemplateDetail(),
      stubPutTemplate(),
    ])
    await login(page, { name: 'A TestUser' })
    await page.goto(`/edit-template/${testTemplateDetail.id}`)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should render Edit Template input form', async ({ page }) => {
    // render content correctly
    const testPage = await new EditTemplatePage(page).verifyContent()
    await expect(testPage.groupInput()).toBeVisible()
    await expect(testPage.groupInput()).toHaveValue(testTemplateDetail.groups[0]!.code)
    await expect(testPage.codeInput()).toBeVisible()
    await expect(testPage.codeInput()).toHaveValue(testTemplateDetail.code)
    await expect(testPage.nameInput()).toBeVisible()
    await expect(testPage.nameInput()).toHaveValue(testTemplateDetail.name)
    await expect(testPage.descriptionInput()).toBeVisible()
    await expect(testPage.descriptionInput()).toHaveValue(testTemplateDetail.description)
    await expect(testPage.instructionTextInput()).toBeVisible()
    await expect(testPage.instructionTextInput()).toHaveValue(testTemplateDetail.instructionText!)
    await expect(testPage.submitButton()).toBeVisible()

    // validate input form
    await testPage.codeInput().fill('Invalid code')
    await testPage.nameInput().clear()
    await testPage.submitButton().click()
    await testPage.link('A template code must contain only uppercase letters, numbers and/or underscores').click()
    await expect(testPage.codeInput()).toBeFocused()
    await testPage.link('Enter a template name').click()
    await expect(testPage.nameInput()).toBeFocused()

    // proceed to next page
    await testPage.codeInput().fill('TEST_TMPL')
    await testPage.nameInput().fill('Test Template')
    await testPage.submitButton().click()
    await new DocumentGenerationHomepage(page).verifyContent()
    await expect(page.getByText('Template “Test Template” has been updated')).toBeVisible()
  })
})
