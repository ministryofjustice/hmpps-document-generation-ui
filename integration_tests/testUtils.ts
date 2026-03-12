import { Page } from '@playwright/test'
import tokenVerification from './mockApis/tokenVerification'
import hmppsAuth, { type UserToken } from './mockApis/hmppsAuth'
import { resetStubs } from './mockApis/wiremock'
import { stubGetCaseLoads } from './mockApis/prisonApi'

export { resetStubs }

const DEFAULT_ROLES = ['ROLE_DOCUMENT_GENERATION_RW', 'ROLE_EXTERNAL_MOVEMENTS_TAP_RW']

export const attemptHmppsAuthLogin = async (page: Page) => {
  await page.goto('/')
  page.locator('h1', { hasText: 'Sign in' })
  const url = await hmppsAuth.getSignInUrl()
  await page.goto(url)
}

export const login = async (
  page: Page,
  { name, roles = DEFAULT_ROLES, active = true, authSource = 'nomis' }: UserToken & { active?: boolean } = {},
) => {
  await Promise.all([
    hmppsAuth.favicon(),
    hmppsAuth.stubSignInPage(),
    hmppsAuth.stubSignOutPage(),
    hmppsAuth.token({ ...(name ? { name } : {}), roles, authSource }),
    tokenVerification.stubVerifyToken(active),
    stubGetCaseLoads(),
  ])
  await attemptHmppsAuthLogin(page)
}
