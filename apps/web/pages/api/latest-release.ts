import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/core'
import matter from 'gray-matter'
import { NextApiRequest, NextApiResponse } from 'next'

import { IS_PRODUCTION } from '@campsite/config'

import { Changelog } from '@/utils/types'

const appId = process.env.CHANGELOG_APP_ID
const privateKey = process.env.CHANGELOG_PRIVATE_KEY
const clientId = process.env.CHANGELOG_CLIENT_ID
const clientSecret = process.env.CHANGELOG_CLIENT_SECRET
const installationId = process.env.CHANGELOG_INSTALLATION_ID

const appOctokit = new Octokit({
  authStrategy: createAppAuth,
  auth: { appId, privateKey, clientId, clientSecret, installationId }
})

interface GitHubRelease {
  id: number
  name: string
  published_at: string
  body: string
}

async function getLatestChangelog(): Promise<Changelog[] | null> {
  const { data } = await appOctokit.request('GET /repos/{owner}/{repo}/releases', {
    owner: 'campsite',
    repo: 'campsite',
    per_page: 3
  })

  return data.map((d) => cleanRelease(d as any))
}

// @ts-ignore: Required req param needed but unused
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Disable hitting the GitHub API in local dev to avoid rate limiting ourselves
  // When testing in-app releases, temporarily disable this check
  if (!IS_PRODUCTION) {
    return res.status(200).json(null)
  }

  const latest_releases = await getLatestChangelog()

  if (!latest_releases || latest_releases instanceof Error) {
    return res.status(500).json({ message: 'Failed to find latest release' })
  }

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=86400')

  return res.status(200).json(latest_releases)
}

export default handler

function cleanRelease(release: GitHubRelease): Changelog {
  const { data: raw } = matter(release.body)

  return {
    title: raw.title,
    slug: raw.slug,
    published_at: raw.date
  }
}

export const config = {
  api: {
    externalResolver: true
  }
}
