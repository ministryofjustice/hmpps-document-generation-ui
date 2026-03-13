import { test, expect } from '@playwright/test'
import { stubComponents } from '../../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../../integration_tests/testUtils'
import { AddTemplatePage } from './test.page'
import {
  stubGetTemplateGroups,
  stubGetTemplates,
  stubGetTemplateVariables,
  stubPutTemplate,
} from '../../../integration_tests/mockApis/documentGenerationApi'
import { DocumentGenerationHomepage } from '../test.page'

test.describe('/add-template not authorised', () => {
  test('should show not authorised if user does not have the required role for the template', async ({ page }) => {
    await Promise.all([stubComponents(), stubGetTemplateGroups(), stubGetTemplateVariables()])
    await login(page, { name: 'User without template group role', roles: ['ROLE_DOCUMENT_GENERATION_RW'] })
    await page.goto('/add-template')
    await expect(page.getByRole('heading', { name: 'You do not have permission to access this page' })).toBeVisible()
    await resetStubs()
  })
})

test.describe('/add-template', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      stubComponents(),
      stubGetTemplateGroups(),
      stubGetTemplates(),
      stubGetTemplateVariables(),
      stubPutTemplate(),
    ])
    await login(page, { name: 'A TestUser' })
    await page.goto('/add-template')
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should render Add Template input form', async ({ page }) => {
    // render content correctly
    const testPage = await new AddTemplatePage(page).verifyContent()
    await expect(testPage.groupInput()).toBeVisible()
    await expect(testPage.codeInput()).toBeVisible()
    await expect(testPage.nameInput()).toBeVisible()
    await expect(testPage.descriptionInput()).toBeVisible()
    await expect(testPage.instructionTextInput()).toBeVisible()
    await expect(testPage.submitButton()).toBeVisible()

    // validate input form
    await testPage.submitButton().click()
    await testPage.link('Enter a code').click()
    await expect(testPage.codeInput()).toBeFocused()
    await testPage.link('Enter a template name').click()
    await expect(testPage.nameInput()).toBeFocused()
    await testPage.link('You must select a file').click()
    await expect(testPage.fileInput()).toBeFocused()
    await expect(testPage.link('Select at least one template variable')).toBeVisible()

    await testPage.codeInput().fill('TEST_TMPL')
    await testPage.nameInput().fill('Test Template')
    await testPage.descriptionInput().fill('Lorem ipsum')
    await testPage.instructionTextInput().fill('dolor sit')
    await testPage.fileInput().setInputFiles('./integration_tests/data/test-file.dotx')
    await testPage.variableCheckbox().click()
    await testPage.submitButton().click()

    // proceed to next page
    await new DocumentGenerationHomepage(page).verifyContent()
  })
})
