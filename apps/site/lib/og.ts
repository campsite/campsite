import { SITE_URL } from '@campsite/config'

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630
}

export function getOgImageMetadata(title: string) {
  return {
    ...OG_IMAGE_SIZE,
    type: 'image/png',
    url: `${SITE_URL}/og?title=${encodeURIComponent(title)}`
  }
}
