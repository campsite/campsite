import { SanityDocument } from 'next-sanity'

import { client } from '@/sanity/client'

// for now we fetch the first 100 and don't paginate — when we have more than 100 pages, we'll add pagination
const GLOSSARIES_QUERY = `*[
  _type == "glossary"
  && defined(slug.current)
]|order(publishedAt desc)[0...100]{_id, title, category, slug, publishedAt}`

const options = { next: { revalidate: 30 } }

export async function getGlossaries() {
  return await client.fetch<SanityDocument[]>(GLOSSARIES_QUERY, {}, options)
}
