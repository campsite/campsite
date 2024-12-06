import { Api } from '@campsite/types'

let baseUrl = 'http://api.campsite.test:3001'

if (process.env.NODE_ENV === 'production') {
  baseUrl = 'http://campsite-api.internal:8080'
}

export const api = new Api({
  baseUrl,
  baseApiParams: {
    headers: { 'Content-Type': 'application/json' },
    format: 'json'
  }
})
