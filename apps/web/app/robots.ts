import { MetadataRoute } from 'next'

import { SITE_URL } from '@campsite/config'

export default function robots(): MetadataRoute.Robots {
  // Disallow crawling all pages under `app.campsite` and point the sitemap to `www.campsite`
  return {
    rules: {
      userAgent: '*',
      disallow: '/'
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  }
}
