import { getGlossaries } from 'app/glossary/_cms/getGlossaries'
import { GlossaryIndex } from 'app/glossary/_components/GlossaryIndex'

import { SITE_URL } from '@campsite/config'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: './'
  },
  title: 'Slack Glossary · Campsite',
  description: 'Tips and tricks to make the most out of Slack'
}

export default async function BlogPage() {
  const posts = await getGlossaries()

  return <GlossaryIndex posts={posts} />
}
