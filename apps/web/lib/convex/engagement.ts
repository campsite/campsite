import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

export async function getLegacyFavorites(accessToken: string, slug: string) {
  return await getConvexServerClient(accessToken).query(api.engagement.getLegacyFavorites, { slug })
}

export async function createLegacyFavorite(
  accessToken: string,
  data: {
    slug: string
    favoritableType: 'Project' | 'MessageThread' | 'Note' | 'Post' | 'Call'
    favoritableId: string
  }
) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.createLegacyFavorite, data)
}

export async function deleteLegacyFavorite(accessToken: string, data: { slug: string; favoriteId: string }) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.deleteLegacyFavorite, data)
}

export async function deleteLegacyFavoriteByFavoritable(
  accessToken: string,
  data: {
    slug: string
    favoritableType: 'Project' | 'MessageThread' | 'Note' | 'Post' | 'Call'
    favoritableId: string
  }
) {
  const favorites = await getLegacyFavorites(accessToken, data.slug)
  const favorite = favorites.find((entry: { favoritable_type: string; favoritable_id: string; id: string }) => {
    return entry.favoritable_type === data.favoritableType && entry.favoritable_id === data.favoritableId
  })

  if (!favorite) {
    return {}
  }

  return await deleteLegacyFavorite(accessToken, { slug: data.slug, favoriteId: favorite.id })
}

export async function reorderLegacyFavorites(
  accessToken: string,
  data: { slug: string; favorites: { id: string; position: number }[] }
) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.reorderLegacyFavorites, data)
}

export async function getLegacyFollowUpsPage(
  accessToken: string,
  data: { slug: string; after?: string; limit?: number }
) {
  return await getConvexServerClient(accessToken).query(api.engagement.getLegacyFollowUpsPage, data)
}

export async function createLegacyFollowUp(
  accessToken: string,
  data: { slug: string; subjectType: 'Post' | 'Note' | 'Comment' | 'Call'; subjectId: string; showAt: number }
) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.createLegacyFollowUp, data)
}

export async function updateLegacyFollowUp(
  accessToken: string,
  data: { slug: string; id: string; showAt: number }
) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.updateLegacyFollowUp, data)
}

export async function deleteLegacyFollowUp(accessToken: string, data: { slug: string; id: string }) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.deleteLegacyFollowUp, data)
}

export async function createLegacySubscription(
  accessToken: string,
  data: { slug: string; subscribableType: 'Post' | 'Project' | 'Note'; subscribableId: string; cascade?: boolean }
) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.createLegacySubscription, data)
}

export async function deleteLegacySubscription(
  accessToken: string,
  data: { slug: string; subscribableType: 'Post' | 'Project' | 'Note'; subscribableId: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.deleteLegacySubscription, data)
}

export async function createLegacyReaction(
  accessToken: string,
  data: {
    slug: string
    subjectType: 'Post' | 'Comment' | 'Message'
    subjectId: string
    content?: string
    customContent?: { id: string; name: string; file_url: string; created_at: string }
  }
) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.createLegacyReaction, data)
}

export async function deleteLegacyReaction(accessToken: string, data: { slug: string; reactionId: string }) {
  return await getConvexServerClient(accessToken).mutation(api.engagement.deleteLegacyReaction, data)
}
