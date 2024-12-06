import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { secret, rpath } = request.query

  if (secret !== process.env.REVALIDATE_STATIC_CACHE_TOKEN) {
    return response.status(401).json({ message: 'Invalid token' })
  }

  try {
    await response.revalidate(rpath as string)
    return response.json({ revalidated: true })
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return response.status(500).send('Error revalidating')
  }
}
