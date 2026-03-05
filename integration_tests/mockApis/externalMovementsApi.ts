import { stubFor } from './wiremock'

export const stubExternalMovementsApiHealth = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/external-movements-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })
