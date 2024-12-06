import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import fetch from 'node-fetch'

import { WEB_URL } from '@campsite/config'
import { isValidHttpUrl } from '@campsite/ui/src/utils'

const metascraper = require('metascraper')([
  require('metascraper-audio')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-readability')(),
  require('metascraper-spotify')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-twitter')(),
  require('metascraper-youtube')(),
  require('metascraper-video')()
])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    methods: ['GET', 'HEAD'],
    origin: WEB_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  })

  const encodedTargetUrl = req.query.url as string
  const targetUrl = decodeURIComponent(encodedTargetUrl)

  if (!targetUrl || !isValidHttpUrl(targetUrl)) {
    res.status(400).send('Please provide a valid URL in the "url" query parameter.')
    return
  }

  try {
    const response = await fetch(targetUrl)

    let html = ''

    if (!response || !response.body)
      return res.status(401).json({ error: `Unable to get information about "${targetUrl}".` })

    for await (const chunk of response.body) {
      // Stream the response until we find the end of the </head> tag (we don't
      // need to fetch the entire HTML response).
      html += chunk.toString()
      if (html.includes(`</head>`)) break
    }
    const metadata = await metascraper({ html, url: targetUrl })

    res.setHeader('Cache-Control', 's-maxage=2592000') // cache for one month (30 days)
    res.status(200).json(metadata)
  } catch (err) {
    res.status(401).json({ error: `Unable to get information about "${targetUrl}".` })
  }
}
