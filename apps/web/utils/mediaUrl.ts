import { MEDIA_BASE_URL } from '@campsite/config'

function stripEdgeSlashes(value: string) {
  return value.replace(/^\/+/, '').replace(/\/+$/, '')
}

export function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

export function resolveMediaUrl(pathOrUrl: string) {
  if (!pathOrUrl) {
    return pathOrUrl
  }

  if (isAbsoluteUrl(pathOrUrl)) {
    return pathOrUrl
  }

  return `${stripEdgeSlashes(MEDIA_BASE_URL)}/${stripEdgeSlashes(pathOrUrl)}`
}
