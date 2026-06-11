const PERMITTED_DOMAINS = [
  'https://external-movements-dev.hmpps.service.justice.gov.uk',
  'https://external-movements-preprod.hmpps.service.justice.gov.uk',
  'https://external-movements.hmpps.service.justice.gov.uk',
]

const REDIRECT_LABELS = [
  {
    regex: /external-movements[\w-]*\.hmpps\.service\.justice\.gov\.uk\/temporary-absences-home/,
    label: 'Return to temporary absences',
  },
  {
    regex: /external-movements[\w-]*\.hmpps\.service\.justice\.gov\.uk\/temporary-absence-authorisations\/[\w-]+/,
    label: 'Return to absence plan',
  },
]

export const permittedRedirect = (returnTo?: string) => {
  const url = returnTo && PERMITTED_DOMAINS.find(domain => returnTo?.startsWith(`${domain}/`)) ? returnTo : null
  if (url) {
    return {
      url,
      label: REDIRECT_LABELS.find(({ regex }) => url.match(regex))?.label ?? 'Exit',
    }
  }
  return null
}
