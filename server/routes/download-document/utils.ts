import { Services } from '../../services'
import { ApiRequestContext } from '../../data/customRestClient'
import { formatAddress } from '../../utils/format'
import { convertToTitleCase } from '../../utils/utils'

export type GenerateDocumentQuery = { prisonId?: string; prisonNumber?: string }

export const mapTemplateVariables = async (
  { prisonerSearchService, prisonRegisterService }: Services,
  context: ApiRequestContext,
  query: GenerateDocumentQuery,
) => {
  const variables: { [key: string]: string } = {}

  if (query.prisonId) {
    const prison = await prisonRegisterService.getPrisonDetails(context, query.prisonId)
    variables['PRISON__CODE'] = prison.prisonId
    variables['PRISON__NAME'] = prison.prisonName
    variables['PRISON__ADDRESS'] = formatAddress(prison.addresses[0])
  }

  if (query.prisonNumber) {
    const prisoner = await prisonerSearchService.getPrisonerDetails(context, query.prisonNumber)
    if (prisoner) {
      variables['PERSON__NAME'] = convertToTitleCase(
        prisoner.middleNames
          ? `${prisoner.firstName} ${prisoner.middleNames} ${prisoner.lastName}`
          : `${prisoner.firstName} ${prisoner.lastName}`,
      )
      variables['PERSON__IMAGE'] = prisoner.prisonerNumber
      variables['PERSON__PRISON_NUMBER'] = prisoner.prisonerNumber
      variables['PERSON__COURT_REFERENCE_NUMBER'] = prisoner.croNumber ?? ''
      variables['PERSON__POLICE_NATIONAL_COMPUTER_NUMBER'] = prisoner.pncNumber ?? ''
      variables['PERSON__BOOKING_NUMBER'] = prisoner.bookNumber ?? ''
      variables['PERSON__DATE_OF_BIRTH'] = prisoner.dateOfBirth
      variables['PERSON__SECURITY_CATEGORY'] = prisoner.category ?? ''
    }
  }
  return variables
}
