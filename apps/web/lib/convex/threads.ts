import { getConvexServerClient } from './server'

async function callThreadFunction<T>(accessToken: string, name: string, args: Record<string, unknown>) {
  const client = getConvexServerClient(accessToken)

  return (await (client as any).function(name, undefined, args)) as T
}

export async function getLegacyThreads(accessToken: string, data: { slug: string }) {
  return await callThreadFunction(accessToken, 'threads:getLegacyThreads', data)
}

export async function promoteLegacyThreadsCompat(accessToken: string, data: { slug: string }) {
  return await callThreadFunction(accessToken, 'threads:promoteLegacyThreadsCompat', data)
}

export async function getLegacyThread(accessToken: string, data: { slug: string; threadId: string }) {
  return await callThreadFunction(accessToken, 'threads:getLegacyThreadById', data)
}

export async function getLegacyDm(accessToken: string, data: { slug: string; username: string }) {
  return await callThreadFunction(accessToken, 'threads:getLegacyDmByUsername', data)
}

export async function getLegacyIntegrationDm(
  accessToken: string,
  data: { slug: string; oauthApplicationId: string }
) {
  return await callThreadFunction(accessToken, 'threads:getLegacyIntegrationDmByOauthApplicationId', data)
}

export async function createLegacyThread(
  accessToken: string,
  data: {
    slug: string
    group?: boolean
    title?: string
    memberIds?: string[]
    oauthApplicationIds?: string[]
    content?: string
    attachments?: {
      file_path: string
      file_type: string
      preview_file_path?: string | null
      name?: string | null
      size?: number | null
      width?: number
      height?: number
      duration?: number
    }[]
  }
) {
  return await callThreadFunction(accessToken, 'threads:createLegacyThread', data)
}

export async function updateLegacyThread(
  accessToken: string,
  data: { slug: string; threadId: string; title?: string; imagePath?: string | null }
) {
  return await callThreadFunction(accessToken, 'threads:updateLegacyThread', data)
}

export async function deleteLegacyThread(accessToken: string, data: { slug: string; threadId: string }) {
  return await callThreadFunction(accessToken, 'threads:deleteLegacyThread', data)
}

export async function getLegacyThreadMessages(
  accessToken: string,
  data: { slug: string; threadId: string; after?: string; limit?: number }
) {
  return await callThreadFunction(accessToken, 'threads:getLegacyThreadMessagesPage', data)
}

export async function createLegacyThreadMessage(
  accessToken: string,
  data: {
    slug: string
    threadId: string
    content: string
    replyTo?: string
    attachments?: {
      file_path: string
      file_type: string
      preview_file_path?: string | null
      name?: string | null
      size?: number | null
      width?: number
      height?: number
      duration?: number
      no_video_track?: boolean
    }[]
  }
) {
  return await callThreadFunction(accessToken, 'threads:createLegacyThreadMessage', data)
}

export async function updateLegacyThreadMessage(
  accessToken: string,
  data: { slug: string; threadId: string; messageId: string; content: string }
) {
  return await callThreadFunction(accessToken, 'threads:updateLegacyThreadMessage', data)
}

export async function deleteLegacyThreadMessage(
  accessToken: string,
  data: { slug: string; threadId: string; messageId: string }
) {
  return await callThreadFunction(accessToken, 'threads:deleteLegacyThreadMessage', data)
}

export async function deleteLegacyMessageAttachment(
  accessToken: string,
  data: { slug: string; messageId: string; attachmentId: string }
) {
  return await callThreadFunction(accessToken, 'threads:deleteLegacyMessageAttachment', data)
}

export async function getLegacyThreadMembership(
  accessToken: string,
  data: { slug: string; threadId: string }
) {
  return await callThreadFunction(accessToken, 'threads:getLegacyThreadMembership', data)
}

export async function updateLegacyThreadMembership(
  accessToken: string,
  data: { slug: string; threadId: string; notificationLevel: 'all' | 'mentions' | 'none' }
) {
  return await callThreadFunction(accessToken, 'threads:updateLegacyThreadMembership', data)
}

export async function leaveLegacyThread(accessToken: string, data: { slug: string; threadId: string }) {
  return await callThreadFunction(accessToken, 'threads:leaveLegacyThread', data)
}

export async function markLegacyThreadRead(accessToken: string, data: { slug: string; threadId: string }) {
  return await callThreadFunction(accessToken, 'threads:markLegacyThreadRead', data)
}

export async function markLegacyThreadUnread(accessToken: string, data: { slug: string; threadId: string }) {
  return await callThreadFunction(accessToken, 'threads:markLegacyThreadUnread', data)
}

export async function forceLegacyThreadNotification(accessToken: string, data: { slug: string; threadId: string }) {
  return await callThreadFunction(accessToken, 'threads:forceLegacyThreadNotification', data)
}

export async function getLegacyThreadOauthApplications(
  accessToken: string,
  data: { slug: string; threadId: string }
) {
  return await callThreadFunction(accessToken, 'threads:getLegacyThreadOauthApplications', data)
}

export async function createLegacyThreadOauthApplication(
  accessToken: string,
  data: { slug: string; threadId: string; oauthApplicationId: string }
) {
  return await callThreadFunction(accessToken, 'threads:createLegacyThreadOauthApplication', data)
}

export async function deleteLegacyThreadOauthApplication(
  accessToken: string,
  data: { slug: string; threadId: string; oauthApplicationId: string }
) {
  return await callThreadFunction(accessToken, 'threads:deleteLegacyThreadOauthApplication', data)
}

export async function updateLegacyThreadOtherMembers(
  accessToken: string,
  data: { slug: string; threadId: string; memberIds: string[] }
) {
  return await callThreadFunction(accessToken, 'threads:updateLegacyThreadOtherMembers', data)
}
