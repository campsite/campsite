export function urlToHlsUrl(url: string) {
  const urlObj = new URL(url)
  const pathname = urlObj.pathname
  const pathnameWithoutLeadingSlash = pathname.substring(1)
  const pathnameWithoutExtension = pathnameWithoutLeadingSlash.substring(0, pathname.lastIndexOf('.') - 1)
  const hlsHost =
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
      ? 'd1tk25h31rf8pv.cloudfront.net' // campsite-hls-dev
      : 'd2m0evjsyl9ile.cloudfront.net' // campsite-hls

  const width = 1920
  const height = 1080
  const size = `${width}x${height}`

  const result = `https://${hlsHost}/${pathnameWithoutExtension}${size}.m3u8?width=${width}&height=${height}&mediafilename=${pathnameWithoutLeadingSlash}`

  return result
}
