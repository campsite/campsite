import { NextApiRequest, NextApiResponse } from 'next'

function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    buildId: process.env.VERCEL_GIT_COMMIT_SHA
  })
}

export default handler
