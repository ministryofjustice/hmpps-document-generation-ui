import { format } from 'date-fns'
import { Services } from '../../services'
import { ApiRequestContext } from '../../data/customRestClient'
import { formatAddress } from '../../utils/format'
import { convertToTitleCase } from '../../utils/utils'

export type GenerateDocumentQuery = { prisonId?: string; prisonNumber?: string; absenceId?: string }

export const mapTemplateVariables = async (
  { prisonerSearchService, prisonRegisterService, externalMovementsService }: Services,
  context: ApiRequestContext,
  query: GenerateDocumentQuery,
) => {
  const variables: { [key: string]: string } = {}

  if (query.prisonId) {
    const prison = await prisonRegisterService.getPrisonDetails(context, query.prisonId)
    variables['prsnCode'] = prison.prisonId
    variables['prsnName'] = prison.prisonName
    variables['prsnAddress'] = formatAddress(prison.addresses[0])
  }

  if (query.prisonNumber) {
    const prisoner = await prisonerSearchService.getPrisonerDetails(context, query.prisonNumber)
    if (prisoner) {
      variables['perName'] = convertToTitleCase(
        prisoner.middleNames
          ? `${prisoner.firstName} ${prisoner.middleNames} ${prisoner.lastName}`
          : `${prisoner.firstName} ${prisoner.lastName}`,
      )
      variables['perFirstName'] = prisoner.firstName
      variables['perMiddleNames'] = prisoner.middleNames ?? ''
      variables['perLastName'] = prisoner.lastName
      variables['perImage'] = prisoner.prisonerNumber
      variables['perPrsnNo'] = prisoner.prisonerNumber
      variables['perCrn'] = prisoner.croNumber ?? ''
      variables['perPnc'] = prisoner.pncNumber ?? ''
      variables['perbookNo'] = prisoner.bookNumber ?? ''
      variables['perDob'] = prisoner.dateOfBirth
      variables['perSecCat'] = prisoner.category ?? ''
    }
  }

  if (
    query.absenceId &&
    (context.res.locals.user.userRoles.includes('EXTERNAL_MOVEMENTS_TAP_RO') ||
      context.res.locals.user.userRoles.includes('EXTERNAL_MOVEMENTS_TAP_RW'))
  ) {
    const absence = await externalMovementsService.getTapAuthorisation(context, query.absenceId)
    if (absence) {
      variables['tapStartDate'] = absence.start
      variables['tapStartTime'] = absence.occurrences[0]?.start ? format(absence.occurrences[0].start, 'HH:mm') : ''
      variables['tapEndDate'] = absence.end
      variables['tapEndTime'] = absence.occurrences[0]?.start ? format(absence.occurrences[0].end, 'HH:mm') : ''
      variables['tapCat'] =
        absence.absenceReason?.description ??
        absence.absenceReasonCategory?.description ??
        absence.absenceSubType?.description ??
        absence.absenceType?.description ??
        ''
    }
  }

  return variables
}
