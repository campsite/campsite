import env from '../env'

export function apiUrl(path: string) {
  return env.API_BASE + path
}

export function authUrl(path: string) {
  // important: this rename is only necessary in production; local dev doesn't use the auth subdomain
  const base = env.API_BASE.replace('://api.', '://auth.')

  return base + path
}
