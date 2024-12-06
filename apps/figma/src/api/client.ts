import { Api } from '@campsite/types/generated'

export const client = new Api({
  baseUrl: window.API_URL,
  baseApiParams: {
    headers: { 'Content-Type': 'application/json' },
    format: 'json'
  }
})
