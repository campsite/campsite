import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import { WEB_URL } from '@campsite/config'
import { isValidHttpUrl } from '@campsite/ui/src/utils'

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

    if (!response || !response.ok)
      return res.status(401).json({ error: `Unable to get information about "${targetUrl}".` })

    const oembed = await response.json()

    res.setHeader('Cache-Control', 's-maxage=2592000') // cache for one month (30 days)
    res.status(200).json(oembed)
  } catch (err) {
    res.status(401).json({ error: `Unable to get information about "${targetUrl}".` })
  }
}
