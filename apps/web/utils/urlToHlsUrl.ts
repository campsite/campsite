function getHlsBaseUrl() {
  return process.env.NEXT_PUBLIC_HLS_BASE_URL || null
}

export function urlToHlsUrl(url: string) {
  const hlsBaseUrl = getHlsBaseUrl()

  if (!hlsBaseUrl) {
    return null
  }

  const hlsUrl = new URL(hlsBaseUrl)
  const urlObj = new URL(url)
  const pathname = urlObj.pathname
  const pathnameWithoutLeadingSlash = pathname.substring(1)
  const pathnameWithoutExtension = pathnameWithoutLeadingSlash.substring(0, pathname.lastIndexOf('.') - 1)

  const width = 1920
  const height = 1080
  const size = `${width}x${height}`

  hlsUrl.pathname = `/${pathnameWithoutExtension}${size}.m3u8`
  hlsUrl.searchParams.set('width', `${width}`)
  hlsUrl.searchParams.set('height', `${height}`)
  hlsUrl.searchParams.set('mediafilename', pathnameWithoutLeadingSlash)

  return hlsUrl.toString()
}
