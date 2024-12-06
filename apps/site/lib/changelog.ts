import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/core'
import markdownToHtml from 'cmark-gfm-js'
import matter from 'gray-matter'

import { SITE_URL } from '@campsite/config'

import { Changelog, GitHubRelease } from '@/types/index'

export const PAGE_LIMIT = 10

const appId = process.env.CHANGELOG_APP_ID
const privateKey = process.env.CHANGELOG_PRIVATE_KEY
const clientId = process.env.CHANGELOG_CLIENT_ID
const clientSecret = process.env.CHANGELOG_CLIENT_SECRET
const installationId = process.env.CHANGELOG_INSTALLATION_ID

const appOctokit = new Octokit({
  authStrategy: createAppAuth,
  auth: { appId, privateKey, clientId, clientSecret, installationId }
})

export async function getChangelog(): Promise<Changelog[]> {
  try {
    const { data } = await appOctokit.request('GET /repos/{owner}/{repo}/releases{?per_page,page}', {
      owner: 'campsite',
      repo: 'campsite',
      per_page: 100,
      page: 1
    })

    return data.map(cleanRelease).filter(filterChangelogs)
  } catch (e) {
    return []
  }
}

export function enhanceContributor(username: string) {
  const team = [
    {
      username: 'brianlovin',
      name: 'Brian Lovin',
      avatarRelativeUrl: `/img/team/brian.jpeg`,
      avatarAbsoluteUrl: `${SITE_URL}/img/team/brian.jpeg`,
      twitter: 'https://twitter.com/brian_lovin',
      role: 'Co-founder'
    },
    {
      username: 'pixeljanitor',
      name: 'Derek Briggs',
      avatarRelativeUrl: `/img/team/derek.jpeg`,
      avatarAbsoluteUrl: `${SITE_URL}/img/team/derek.jpeg`,
      twitter: 'https://twitter.com/pixeljanitor',
      role: 'Engineer'
    },
    {
      username: 'rnystrom',
      name: 'Ryan Nystrom',
      avatarRelativeUrl: `/img/team/ryan.jpg`,
      avatarAbsoluteUrl: `${SITE_URL}/img/team/ryan.jpg`,
      twitter: 'https://twitter.com/_ryannystrom',
      role: 'Co-founder'
    },
    {
      username: 'jespr',
      name: 'Jesper Christiansen',
      avatarRelativeUrl: `/img/team/jesper.jpeg`,
      avatarAbsoluteUrl: `${SITE_URL}/img/team/jesper.jpeg`,
      twitter: 'https://twitter.com/jespr',
      role: 'Engineer'
    },
    {
      username: 'nholden',
      name: 'Nick Holden',
      avatarRelativeUrl: `/img/team/nick.jpeg`,
      avatarAbsoluteUrl: `${SITE_URL}/img/team/nick.jpeg`,
      twitter: 'https://twitter.com/NickyHolden',
      role: 'Engineer'
    },
    {
      username: 'jeffrafter',
      name: 'Jeff Rafter',
      avatarRelativeUrl: `/img/team/jeffrafter.png`,
      avatarAbsoluteUrl: `${SITE_URL}/img/team/jeffrafter.png`,
      twitter: 'https://twitter.com/jeffrafter',
      role: 'Engineer'
    },
    {
      username: 'joshpensky',
      name: 'Josh Pensky',
      avatarRelativeUrl: `/img/team/josh.png`,
      avatarAbsoluteUrl: `${SITE_URL}/img/team/josh.png`,
      twitter: 'https://twitter.com/josh_jpeg',
      role: 'Engineer'
    },
    {
      username: 'danphilibin',
      name: 'Dan Philibin',
      avatarRelativeUrl: `/img/team/dan.jpg`,
      avatarAbsoluteUrl: `${SITE_URL}/img/team/dan.jpg`,
      twitter: 'https://twitter.com/danphilibin',
      role: 'Engineer'
    },
    {
      username: 'pondorasti',
      name: 'Alexandru Ţurcanu',
      avatarRelativeUrl: `/img/team/alexandru.png`,
      avatarAbsoluteUrl: `${SITE_URL}/img/team/alexandru.png`,
      twitter: 'https://twitter.com/pondorasti',
      role: 'Engineer'
    }
  ]

  return team.find((t) => t.username.toLowerCase() === username.trim().toLowerCase()) ?? null
}

function cleanRelease(release: GitHubRelease): Changelog {
  const { content, data: raw } = matter(release.body)

  const data = {
    title: raw.title,
    slug: raw.slug,
    date: new Date(raw.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    isoDate: new Date(raw.date).toISOString(),
    feature_image: raw.feature_image ?? null,
    contributors: raw.contributors ? raw.contributors.split(',').map(enhanceContributor).filter(Boolean) : [],
    ignore: raw.ignore ?? false,
    prerelease: release.prerelease ?? false
  }

  const content_html = markdownToHtml.convert(content)

  return { content, content_html, data }
}

function filterChangelogs(changelog: Changelog) {
  return Boolean(changelog.data.ignore) === false && !changelog.data.prerelease
}
