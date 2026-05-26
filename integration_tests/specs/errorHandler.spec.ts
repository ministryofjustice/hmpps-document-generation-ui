import { expect, test } from '@playwright/test'
import { stubComponents } from '../mockApis/componentsApi'
import { login } from '../testUtils'

test.describe('test error handlers', () => {
  test.beforeEach(async ({ page }) => {
    await stubComponents()
    await login(page, { name: 'A TestUser' })
  })

  test('should show page not found when 404', async ({ page }) => {
    await page.goto('/non-existing-page')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  test.skip('should show user error message on API errors', async ({ page }) => {
    // TODO: implements test for API error message

    // await stubApiError()
    await page.goto(`/page-that-requires-API-call`)
    await expect(page.getByRole('link', { name: 'Stubbed API error returned' })).toBeVisible()

    expect(await page.title()).toMatch(/^Error: .* - DPS$/)
  })
})
