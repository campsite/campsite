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
    const targetResponse = await fetch(targetUrl)

    if (!targetResponse || !targetResponse.ok) {
      throw new Error(`Unable to get information about "${targetUrl}".`)
    }

    const content = await targetResponse.blob()
    const contentType = content.type

    if (!contentType.startsWith('image')) {
      throw new Error(`Content at "${targetUrl}" is not an image.`)
    }

    const buffer = Buffer.from(await content.arrayBuffer())

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': `public, immutable, no-transform, s-maxage=2592000, max-age=2592000`
    })
    res.end(buffer)
  } catch (err) {
    res.status(401).json({ error: `Unable to get information about "${targetUrl}".` })
  }
}
