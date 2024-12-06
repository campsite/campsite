import { NextApiRequestCookies } from 'next/dist/server/api-utils'

const ApiCookieName = '_campsite_api_session'

export const SsrSecretHeader: Record<string, string> = { 'x-campsite-ssr-secret': process.env.SSR_SECRET || '' }

export function apiCookieHeaders(cookies: NextApiRequestCookies) {
  let headers: Record<string, string> = {}

  if (cookies[ApiCookieName]) {
    const apiCookie = encodeURIComponent(cookies[ApiCookieName])

    headers['Cookie'] = `${ApiCookieName}=${apiCookie}`
  }

  return { ...headers, ...SsrSecretHeader }
}
