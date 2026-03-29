import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

function getTagsClient(accessToken?: string | null) {
  return getConvexServerClient(accessToken)
}

export async function getLegacySyncTags(accessToken: string, data: { slug: string }) {
  return await getTagsClient(accessToken).query(api.content.getLegacySyncTags, data)
}

export async function getLegacyTagsPage(
  accessToken: string,
  data: { slug: string; q?: string; after?: string; limit?: number }
) {
  return await getTagsClient(accessToken).query(api.content.getLegacyTagsPage, data)
}

export async function getLegacyTag(accessToken: string, data: { slug: string; tagName: string }) {
  return await getTagsClient(accessToken).query(api.content.getLegacyTagByName, data)
}

export async function createLegacyTag(accessToken: string, data: { slug: string; name: string }) {
  return await getTagsClient(accessToken).mutation(api.content.createLegacyTag, data)
}

export async function updateLegacyTag(accessToken: string, data: { slug: string; tagName: string; name: string }) {
  return await getTagsClient(accessToken).mutation(api.content.updateLegacyTag, data)
}

export async function deleteLegacyTag(accessToken: string, data: { slug: string; tagName: string }) {
  return await getTagsClient(accessToken).mutation(api.content.deleteLegacyTag, data)
}

export async function getLegacyTagPostsPage(
  accessToken: string,
  data: { slug: string; tagName: string; after?: string; limit?: number }
) {
  return await getTagsClient(accessToken).query(api.content.getLegacyTagPostsPage, data)
}
