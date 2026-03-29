import { Api } from '@campsite/types'

function getBaseUrl() {
  const configured =
    process.env.NEXT_PUBLIC_WEB_URL ||
    process.env.WEB_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000'

  return configured.replace(/\/$/, '')
}

export const api = new Api({
  baseUrl: getBaseUrl(),
  baseApiParams: {
    headers: { 'Content-Type': 'application/json' },
    format: 'json'
  }
})
