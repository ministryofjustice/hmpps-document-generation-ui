import { format } from 'date-fns'
import { Services } from '../../services'
import { ApiRequestContext } from '../../data/customRestClient'
import { formatAddress } from '../../utils/format'
import { convertToTitleCase } from '../../utils/utils'
import { components } from '../../@types/documentGeneration'

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
    variables['prsnSecCat'] = prison.categories.join(', ')
  }

  if (query.prisonNumber) {
    const prisoner = await prisonerSearchService.getPrisonerDetails(context, query.prisonNumber)
    if (prisoner) {
      variables['perName'] = convertToTitleCase(
        prisoner.middleNames
          ? `${prisoner.firstName} ${prisoner.middleNames} ${prisoner.lastName}`
          : `${prisoner.firstName} ${prisoner.lastName}`,
      )
      variables['perFirstName'] = convertToTitleCase(prisoner.firstName)
      variables['perMiddleNames'] = convertToTitleCase(prisoner.middleNames)
      variables['perLastName'] = convertToTitleCase(prisoner.lastName)
      variables['perImage'] = prisoner.prisonerNumber
      variables['perPrsnNo'] = prisoner.prisonerNumber
      variables['perCro'] = prisoner.croNumber ?? ''
      variables['perPnc'] = prisoner.pncNumber ?? ''
      variables['perBookNo'] = prisoner.bookNumber ?? ''
      variables['perDob'] = prisoner.dateOfBirth ? format(prisoner.dateOfBirth, 'dd/MM/yyyy') : ''
      variables['perSecCat'] = prisoner.category ?? ''
      variables['perLocation'] = prisoner.cellLocation ?? ''
    }
  }

  if (
    query.absenceId &&
    (context.res.locals.user.userRoles.includes('EXTERNAL_MOVEMENTS_TAP_RO') ||
      context.res.locals.user.userRoles.includes('EXTERNAL_MOVEMENTS_TAP_RW'))
  ) {
    const occurrence = await externalMovementsService.getTapAuthorisationFirstOccurrence(context, query.absenceId)
    if (occurrence) {
      variables['tapStartDate'] = format(occurrence.start, 'dd/MM/yyyy')
      variables['tapStartTimeHour'] = occurrence.start ? format(occurrence.start, 'HH') : ''
      variables['tapStartTimeMinute'] = occurrence.start ? format(occurrence.start, 'mm') : ''
      variables['tapEndDate'] = format(occurrence.end, 'dd/MM/yyyy')
      variables['tapEndTimeHour'] = occurrence.end ? format(occurrence.end, 'HH') : ''
      variables['tapEndTimeMinute'] = occurrence.end ? format(occurrence.end, 'mm') : ''
      variables['tapCat'] = occurrence.reason.description
    }
  }

  return variables
}

export const getReadOnlyVariables = (template: components['schemas']['TemplateDetail']) => {
  const prisonDetails = template.variables.domains.find(({ code }) => code === 'PRISON')
  const prisonerDetails = template.variables.domains.find(({ code }) => code === 'PERSON')

  return {
    prisonDetails: prisonDetails
      ? {
          ...prisonDetails,
          variables: prisonDetails.variables.filter(({ code }) => code !== 'prsnPhone' && code !== 'prsnEmailFax'),
        }
      : undefined,
    prisonerDetails,
  }
}
