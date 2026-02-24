import { test, expect } from '@playwright/test'
import { stubComponents } from '../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../integration_tests/testUtils'
import { DocumentGenerationHomepage } from './test.page'

test.describe('homepage', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([stubComponents()])
    await login(page, { name: 'A TestUser' })
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should render homepage', async ({ page }) => {
    const testPage = await new DocumentGenerationHomepage(page).verifyContent()
    await expect(testPage.button('Add a template')).toBeVisible()

    await testPage.verifyTableRow(1, ['ROTL 18 licence document', '1 January 2001', /Edit/, /Generate document/])
    await testPage.verifyTableRow(2, ['LISP 3', '1 January 2001', /Edit/, /Generate document/])
  })
})
