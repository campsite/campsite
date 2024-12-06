import { Feed } from 'feed'

import { SITE_URL } from '@campsite/config'

import { Changelog } from '@/types/index'

export async function generateRSS(data: Changelog[]) {
  const date = new Date()
  const updated = new Date(data[0].data.date)
  const author = {
    name: 'Campsite',
    link: SITE_URL
  }

  const feed = new Feed({
    title: 'Campsite Changelog',
    description: 'New features and updates from Campsite.',
    id: SITE_URL,
    link: SITE_URL,
    language: 'en',
    image: `${SITE_URL}/static/meta/android-icon-512x512.png`,
    favicon: `${SITE_URL}/static/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}, Campsite`,
    updated,
    author,
    feedLinks: {
      rss2: `${SITE_URL}/changelog/rss`,
      json: `${SITE_URL}/changelog/feed`,
      atom: `${SITE_URL}/changelog/atom`
    }
  })

  data.forEach((changelog) => {
    const url = `${SITE_URL}/changelog/${changelog.data.slug}`

    feed.addItem({
      title: changelog.data.title,
      id: url,
      link: url,
      description: changelog.content_html,
      author: [author],
      contributor: [author],
      date: new Date(changelog.data.date)
    })
  })

  const rss = feed.rss2()
  const atom = feed.atom1()
  const json = feed.json1()

  return {
    rss,
    atom,
    json
  }
}
