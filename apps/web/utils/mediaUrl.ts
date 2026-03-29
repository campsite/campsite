import { IMGIX_DOMAIN } from '@campsite/config'

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

  return `${stripEdgeSlashes(IMGIX_DOMAIN)}/${stripEdgeSlashes(pathOrUrl)}`
}
