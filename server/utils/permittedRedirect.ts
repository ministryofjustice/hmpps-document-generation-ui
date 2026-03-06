const PERMITTED_DOMAINS = [
  'https://external-movements-dev.hmpps.service.justice.gov.uk',
  'https://external-movements-preprod.hmpps.service.justice.gov.uk',
  'https://external-movements.hmpps.service.justice.gov.uk',
]

export const permittedRedirect = (returnTo?: string) =>
  returnTo && PERMITTED_DOMAINS.find(domain => returnTo?.startsWith(`${domain}/`)) ? returnTo : null
