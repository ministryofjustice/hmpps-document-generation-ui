import { RequestHandler } from 'express'
import DocumentGenerationService from '../../services/apis/documentGenerationService'
import { HmppsUser } from '../../interfaces/hmppsUser'
import { AuthorisedRoles } from './authorisedRoles'

const hasRole = (user: HmppsUser, roles: string[]) => {
  return roles.length === 0 || roles.some(role => user.userRoles.includes(role))
}

export const populateTemplateConfig = (
  documentGenerationService: DocumentGenerationService,
  {
    getGroups = true,
    getVariables = false,
    getTemplate = false,
    requireAdminRole = true,
  }: {
    getGroups?: boolean
    getVariables?: boolean
    getTemplate?: boolean
    requireAdminRole?: boolean
  },
): RequestHandler<{ id: string }> => {
  return async (req, res, next) => {
    if (requireAdminRole && !hasRole(res.locals.user, [AuthorisedRoles.DOCUMENT_GENERATION_RW])) {
      return res.notAuthorised()
    }

    if (!req.method.match(/GET/i)) {
      return next()
    }

    req.middleware ??= {}

    const apiRequests: Promise<unknown>[] = []

    if (getGroups) {
      apiRequests.push(
        documentGenerationService.getGroups({ res }).then(result => {
          req.middleware!.groups = result.groups.filter(({ roles }) => hasRole(res.locals.user, roles))
        }),
      )
    }

    if (getVariables) {
      apiRequests.push(
        documentGenerationService.getTemplateVariables({ res }).then(result => {
          req.middleware!.supportedVariables = result.domains
        }),
      )
    }

    if (getTemplate) {
      apiRequests.push(
        documentGenerationService.getTemplateById({ res }, req.params.id).then(result => {
          req.middleware!.template = result
        }),
      )
    }

    await Promise.all(apiRequests)

    if (getGroups && !req.middleware.groups?.length) {
      return res.notAuthorised()
    }
    if (getTemplate && !req.middleware.template!.groups.some(({ roles }) => hasRole(res.locals.user, roles))) {
      return res.notAuthorised()
    }

    return next()
  }
}
