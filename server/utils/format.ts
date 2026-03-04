import { components } from '../@types/prisonRegister'

export const formatAddress = (address?: components['schemas']['AddressDto'] | undefined) => {
  if (!address) return ''

  return [address!.addressLine1, address!.addressLine2, address!.town, address!.county, address!.postcode]
    .filter(Boolean)
    .join('\n')
}
