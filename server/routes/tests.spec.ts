import { test, expect } from '@playwright/test'
import { stubComponents } from '../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../integration_tests/testUtils'
import { DocumentGenerationHomepage } from './test.page'
import { stubGetTemplateGroups, stubGetTemplates } from '../../integration_tests/mockApis/documentGenerationApi'

test.describe('homepage not authorised', () => {
  test('should not render homepage if user does not have permission for any template group', async ({ page }) => {
    await Promise.all([stubComponents(), stubGetTemplateGroups(), stubGetTemplates()])
    await login(page, { name: 'User without template group role', roles: ['ROLE_DOCUMENT_GENERATION_RW'] })
    await expect(page.getByRole('heading', { name: 'You do not have permission to access this page' })).toBeVisible()
    await resetStubs()
  })
})

test.describe('homepage', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([stubComponents(), stubGetTemplateGroups(), stubGetTemplates()])
    await login(page, { name: 'A TestUser' })
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should render homepage', async ({ page }) => {
    const testPage = await new DocumentGenerationHomepage(page).verifyContent()
    await expect(testPage.button('Add a template')).toBeVisible()
    await expect(testPage.button('Add a template')).toHaveAttribute('href', /\/add-template\?group=EXTERNAL_MOVEMENT$/)

    await testPage.verifyTableRow(1, ['ROTL 18 licence document', /Edit/, /Generate document/])
    await testPage.verifyTableRow(2, ['LISP 3', /Edit/, /Generate document/])

    await expect(testPage.link('Edit ROTL 18 licence document')).toHaveAttribute('href', /\/edit-template\/template-1$/)
    await expect(testPage.link('Edit LISP 3')).toHaveAttribute('href', /\/edit-template\/template-2$/)

    await expect(testPage.link('Generate document for ROTL 18 licence document')).toHaveAttribute(
      'href',
      /\/generate-document\/template-1$/,
    )
    await expect(testPage.link('Generate document for LISP 3')).toHaveAttribute(
      'href',
      /\/generate-document\/template-2$/,
    )
  })
})
