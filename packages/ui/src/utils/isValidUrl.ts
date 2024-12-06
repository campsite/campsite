export function isValidHttpsUrl(str: string) {
  try {
    const url = new URL(str)

    return url.protocol === 'https:'
  } catch (_) {
    return false
  }
}
export function isValidHttpUrl(str: string) {
  try {
    const url = new URL(str)

    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch (_) {
    return false
  }
}

export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
