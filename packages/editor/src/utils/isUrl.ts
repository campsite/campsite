import { figmaRegex } from '@campsite/regex'

export function isUrl(text: string, options?: { requireHostname: boolean }) {
  if (text.match(/\n/)) {
    return false
  }

  try {
    const url = new URL(text)
    const blockedProtocols = ['javascript:', 'file:', 'vbscript:', 'data:']

    if (blockedProtocols.includes(url.protocol)) {
      return false
    }
    if (url.hostname) {
      return true
    }

    return (
      url.protocol !== '' &&
      (url.pathname.startsWith('//') || url.pathname.startsWith('http')) &&
      !options?.requireHostname
    )
  } catch (err) {
    return false
  }
}

export function isFigmaUrl(text: string) {
  return figmaRegex.test(text)
}
