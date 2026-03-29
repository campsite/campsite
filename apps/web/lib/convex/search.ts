import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

const searchApi = api as any

export async function getLegacySearchMixed(
  accessToken: string,
  data: {
    slug: string
    q: string
    focus?: 'posts' | 'calls' | 'notes'
  }
) {
  return await getConvexServerClient(accessToken).query(searchApi.search.getLegacySearchMixed, data)
}

export async function getLegacySearchPosts(
  accessToken: string,
  data: {
    slug: string
    q: string
    project_id?: string
    author?: string
    tag?: string
    limit?: number
  }
) {
  return await getConvexServerClient(accessToken).query(searchApi.search.getLegacySearchPosts, data)
}

export async function getLegacySearchResourceMentions(
  accessToken: string,
  data: {
    slug: string
    q: string
  }
) {
  return await getConvexServerClient(accessToken).query(searchApi.search.getLegacySearchResourceMentions, data)
}
