import { HmppsUser } from '../../interfaces/hmppsUser'
import { CaseLoad } from '../../interfaces/caseLoad'
import { Breadcrumbs } from '../../middleware/breadcrumbs'
import { components } from '../documentGeneration'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void

      middleware?: {
        fileError?: string

        groups?: components['schemas']['Group'][]
        supportedVariables?: components['schemas']['TemplateVariables.Domain'][]
        template?: components['schemas']['TemplateDetail']
      }
    }

    interface Response {
      notFound(): void
      notAuthorised(): void
      getPageViewEvent(isAttempt: boolean): AuditEvent
      setAuditDetails: {
        prisonNumber(prisonNumber: string): void
        searchTerm(searchTerm: string): void
        suppress(suppress: boolean): void
      }
      sendApiEvent?: (apiUrl: string, isAttempt: boolean) => void
    }

    interface Locals {
      user: HmppsUser
      digitalPrisonServicesUrl: string
      prisonerProfileUrl: string
      cspNonce: string
      csrfToken: ReturnType<CsrfTokenGenerator>
      asset_path: string
      applicationName: string
      environmentName: string
      environmentNameColour: string
      feComponents?: {
        sharedData?: {
          activeCaseLoad: CaseLoad
          caseLoads: CaseLoad[]
          services: {
            id: string
            heading: string
            description: string
            href: string
            navEnabled: boolean
          }[]
        }
      }
      auditEvent: {
        who: string
        correlationId: string
        subjectId?: string
        subjectType?: string
        suppress?: boolean
        details?: {
          activeCaseLoadId?: string
          pageUrl: string
          pageName?: Page
          query?: string
          [key: string]: unknown
        }
      }
      formResponses?: Record<string, unknown>
      appInsightsConnectionString?: string
      appInsightsApplicationName?: string
      buildNumber?: string
      breadcrumbs: Breadcrumbs
    }
  }
}
