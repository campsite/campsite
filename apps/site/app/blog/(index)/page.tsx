import { BlogIndex } from 'app/blog/_components/BlogIndex'

import { SITE_URL } from '@campsite/config'

import { getBlogs } from '@/lib/blog'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: './'
  },
  title: 'Field guide · Campsite',
  description: 'Notes and best-practices for effective distributed team communication.'
}

export default function BlogPage() {
  const blogs = getBlogs()

  return <BlogIndex blogs={blogs} />
}
