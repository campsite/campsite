import { getGlossaries } from 'app/glossary/_cms/getGlossaries'
import { MetadataRoute } from 'next'

import { SITE_URL } from '@campsite/config'

import { getBlogs } from '@/lib/blog'
import { getChangelog } from '@/lib/changelog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const changelogs = await getChangelog()
  const glossaries = await getGlossaries()

  return [
    {
      url: SITE_URL,
      lastModified: new Date()
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date()
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date()
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date()
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date()
    },
    {
      url: `${SITE_URL}/dpa`,
      lastModified: new Date()
    },
    {
      url: `${SITE_URL}/changelog`,
      lastModified: new Date()
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date()
    },
    ...getBlogs().map((blog) => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      lastModified: new Date(blog.metadata.publishedAt).toISOString()
    })),
    ...changelogs.map((changelog) => ({
      url: `${SITE_URL}/changelog/${changelog.data.slug}`,
      lastModified: changelog.data.isoDate
    })),
    {
      url: `${SITE_URL}/glossary/slack`,
      lastModified: new Date()
    },
    ...glossaries.map((glossary) => ({
      url: `${SITE_URL}/glossary/${glossary.category}/${glossary.slug.current}`,
      lastModified: glossary._updatedAt
    })),
    {
      url: `${SITE_URL}/resources/linear-keyboard-shortcuts`,
      lastModified: new Date()
    },
    {
      url: `${SITE_URL}/switch-from-slack`,
      lastModified: new Date()
    }
  ]
}
