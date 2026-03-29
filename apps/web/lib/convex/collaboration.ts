import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

export async function getLegacyCustomReactionsPage(
  accessToken: string,
  data: { slug: string; after?: string; limit?: number }
) {
  return await getConvexServerClient(accessToken).query(api.collaboration.getLegacyCustomReactionsPage, data)
}

export async function getLegacyCustomReactionById(accessToken: string, data: { slug: string; id: string }) {
  return await getConvexServerClient(accessToken).query(api.collaboration.getLegacyCustomReactionById, data)
}

export async function getLegacySyncCustomReactions(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).query(api.collaboration.getLegacySyncCustomReactions, data)
}

export async function getLegacyCustomReactionPacks(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).query(api.collaboration.getLegacyCustomReactionPacks, data)
}

export async function createLegacyCustomReaction(
  accessToken: string,
  data: { slug: string; name: string; filePath: string; fileType: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.createLegacyCustomReaction, data)
}

export async function deleteLegacyCustomReaction(accessToken: string, data: { slug: string; id: string }) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.deleteLegacyCustomReaction, data)
}

export async function installLegacyCustomReactionPack(
  accessToken: string,
  data: { slug: string; name: 'blobs' | 'memes' | 'meows' | 'parrots' | 'llamas' }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.installLegacyCustomReactionPack, data)
}

export async function uninstallLegacyCustomReactionPack(
  accessToken: string,
  data: { slug: string; name: 'blobs' | 'memes' | 'meows' | 'parrots' | 'llamas' }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.uninstallLegacyCustomReactionPack, data)
}

export async function getLegacyNoteSyncState(accessToken: string, data: { slug: string; noteId: string }) {
  return await getConvexServerClient(accessToken).query(api.collaboration.getLegacyNoteSyncState, data)
}

export async function updateLegacyNoteSyncState(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    descriptionHtml: string
    descriptionState: string
    descriptionSchemaVersion: number
  }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.updateLegacyNoteSyncState, data)
}

export async function getLegacyOauthApplications(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).query(api.collaboration.getLegacyOauthApplications, data)
}

export async function getLegacyOauthApplicationById(accessToken: string, data: { slug: string; id: string }) {
  return await getConvexServerClient(accessToken).query(api.collaboration.getLegacyOauthApplicationById, data)
}

export async function createLegacyOauthApplication(
  accessToken: string,
  data: {
    slug: string
    name: string
    redirectUri?: string | null
    avatarPath?: string | null
    webhooks?: { id?: string; url: string; event_types?: string[] }[]
  }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.createLegacyOauthApplication, data)
}

export async function updateLegacyOauthApplication(
  accessToken: string,
  data: {
    slug: string
    id: string
    name?: string
    redirectUri?: string | null
    avatarPath?: string | null
    webhooks?: { id?: string; url: string; event_types?: string[] }[]
  }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.updateLegacyOauthApplication, data)
}

export async function deleteLegacyOauthApplication(accessToken: string, data: { slug: string; id: string }) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.deleteLegacyOauthApplication, data)
}

export async function renewLegacyOauthApplicationSecret(accessToken: string, data: { slug: string; id: string }) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.renewLegacyOauthApplicationSecret, data)
}

export async function createLegacyOauthAccessToken(accessToken: string, data: { slug: string; id: string }) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.createLegacyOauthAccessToken, data)
}

export async function getLegacyProjectOauthApplications(
  accessToken: string,
  data: { slug: string; projectId: string }
) {
  return await getConvexServerClient(accessToken).query(api.collaboration.getLegacyProjectOauthApplications, data)
}

export async function attachLegacyProjectOauthApplication(
  accessToken: string,
  data: { slug: string; projectId: string; oauthApplicationId: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.attachLegacyProjectOauthApplication, data)
}

export async function detachLegacyProjectOauthApplication(
  accessToken: string,
  data: { slug: string; projectId: string; id: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.detachLegacyProjectOauthApplication, data)
}

export async function getLegacyThreadOauthApplications(
  accessToken: string,
  data: { slug: string; threadId: string }
) {
  return await getConvexServerClient(accessToken).query(api.collaboration.getLegacyThreadOauthApplications, data)
}

export async function attachLegacyThreadOauthApplication(
  accessToken: string,
  data: { slug: string; threadId: string; oauthApplicationId: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.attachLegacyThreadOauthApplication, data)
}

export async function detachLegacyThreadOauthApplication(
  accessToken: string,
  data: { slug: string; threadId: string; id: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.collaboration.detachLegacyThreadOauthApplication, data)
}
