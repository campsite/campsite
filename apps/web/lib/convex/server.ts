/* eslint-disable max-lines */
import { ConvexHttpClient } from 'convex/browser'

import { api } from '@/convex/_generated/api'

interface AuthUserProfile {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
}

function getConvexUrl() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

  if (!convexUrl) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL must be set')
  }

  return convexUrl
}

// Reuse clients per access token to avoid re-establishing connections
const clientCache = new Map<string, ConvexHttpClient>()

export function getConvexServerClient(accessToken?: string | null) {
  const cacheKey = accessToken ?? '__anonymous__'
  const cached = clientCache.get(cacheKey)

  if (cached) return cached

  const client = new ConvexHttpClient(getConvexUrl())

  if (accessToken) {
    client.setAuth(accessToken)
  }

  // Limit cache size to avoid unbounded growth
  if (clientCache.size > 500) {
    const firstKey = clientCache.keys().next().value

    if (firstKey) clientCache.delete(firstKey)
  }

  clientCache.set(cacheKey, client)

  return client
}

function toViewerProfile(user?: AuthUserProfile | null) {
  if (!user) {
    return undefined
  }

  const firstName = user.firstName?.trim() || undefined
  const lastName = user.lastName?.trim() || undefined
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || undefined

  return {
    email: user.email?.trim().toLowerCase() || undefined,
    firstName,
    lastName,
    name: fullName
  }
}

export async function ensureWorkspace(accessToken: string, user?: AuthUserProfile | null) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.workspace.ensureViewerWorkspace, {
    profile: toViewerProfile(user)
  })
}

export async function getLegacyCurrentUser(accessToken: string) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.workspace.getLegacyCurrentUser, {})
}

export async function getLegacyOrganizationMemberships(accessToken: string) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.workspace.getLegacyOrganizationMemberships, {})
}

export async function getLegacyOrganization(accessToken: string, slug: string) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.workspace.getLegacyOrganizationBySlug, { slug })
}

export async function updateViewerProfile(
  accessToken: string,
  data: {
    avatarPath?: string | null
    coverPhotoPath?: string | null
    email?: string
    name?: string
    username?: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.workspace.updateViewerProfile, data)
}

export async function uploadLegacyFile(
  accessToken: string,
  data: {
    contentType?: string
    file: Blob | ArrayBuffer
    name: string
    size?: number
  }
) {
  const client = getConvexServerClient(accessToken)
  const uploadUrl = await client.mutation(api.files.createUploadUrl, {})

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: data.contentType ? { 'Content-Type': data.contentType } : undefined,
    body: data.file
  })

  if (!uploadResponse.ok) {
    throw new Error('unprocessable: File upload failed')
  }

  const payload = (await uploadResponse.json()) as { storageId?: string }

  if (!payload.storageId) {
    throw new Error('unprocessable: File upload did not return a storage id')
  }

  return await client.mutation(api.files.saveUpload, {
    contentType: data.contentType,
    name: data.name,
    size: data.size,
    storageId: payload.storageId as any
  })
}

export async function updateViewerPreference(accessToken: string, data: { preference: string; value: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.workspace.updateViewerPreference, data)
}

export async function createOrganization(
  accessToken: string,
  data: {
    avatarPath?: string
    name: string
    orgSize?: string
    role?: string
    slug: string
    source?: string
    why?: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.workspace.createOrganization, data)
}

export async function getLegacyPostsPage(
  accessToken: string,
  data: {
    slug: string
    q?: string
    limit?: number
    projectId?: string
    hide_resolved?: boolean
    mode: 'all' | 'for_me' | 'viewer'
    order?: {
      by: 'last_activity_at' | 'published_at'
      direction: 'asc' | 'desc'
    }
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPostsPage, data)
}

export async function getLegacyPersonalDraftPostsPage(
  accessToken: string,
  data: {
    slug: string
    after?: string
    limit?: number
    order?: {
      by: 'last_activity_at'
      direction: 'asc' | 'desc'
    }
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPersonalDraftPostsPage, data)
}

export async function getLegacyMemberPostsPage(
  accessToken: string,
  data: {
    slug: string
    username: string
    after?: string
    limit?: number
    order?: {
      by: 'last_activity_at' | 'published_at'
      direction: 'asc' | 'desc'
    }
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyMemberPostsPage, data)
}

export async function getLegacyPost(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPostById, data)
}

export async function createLegacyPost(
  accessToken: string,
  data: {
    slug: string
    title?: string
    description?: string
    description_html?: string
    project_id?: string
    unfurled_link?: string | null
    parent_id?: string | null
    links: { name: string; url: string }[]
    poll?: {
      description: string
      options: {
        description: string
      }[]
    }
    feedback_request_member_ids?: string[]
    tags?: string[]
    status?: 'none' | 'feedback_requested'
    draft?: boolean
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
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.createLegacyPost, data)
}

export async function updateLegacyPost(
  accessToken: string,
  data: {
    slug: string
    postId: string
    title?: string
    description_html?: string
    project_id?: string | null
    unfurled_link?: string | null
    status?: 'none' | 'feedback_requested'
    feedback_request_member_ids?: string[]
    tags?: string[]
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.updateLegacyPost, data)
}

export async function createLegacyPostPoll(
  accessToken: string,
  data: {
    slug: string
    postId: string
    description: string
    options: {
      description: string
    }[]
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.createLegacyPostPoll, data)
}

export async function updateLegacyPostPoll(
  accessToken: string,
  data: {
    slug: string
    postId: string
    description: string
    options: {
      id?: string
      description: string
    }[]
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.updateLegacyPostPoll, data)
}

export async function deleteLegacyPostPoll(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.deleteLegacyPostPoll, data)
}

export async function voteLegacyPostPollOption(
  accessToken: string,
  data: {
    slug: string
    postId: string
    optionId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.voteLegacyPostPollOption, data)
}

export async function getLegacyPollOptionVotersPage(
  accessToken: string,
  data: {
    slug: string
    postId: string
    pollOptionId: string
    after?: string
    limit?: number
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPollOptionVotersPage, data)
}

export async function createLegacyPostFeedbackRequest(
  accessToken: string,
  data: {
    slug: string
    postId: string
    memberId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.createLegacyPostFeedbackRequest, data)
}

export async function deleteLegacyPostFeedbackRequest(
  accessToken: string,
  data: {
    slug: string
    postId: string
    id: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.deleteLegacyPostFeedbackRequest, data)
}

export async function dismissLegacyPostFeedbackRequest(
  accessToken: string,
  data: {
    slug: string
    postId: string
    feedbackRequestId?: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.dismissLegacyPostFeedbackRequest, data)
}

export async function deleteLegacyPost(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.deleteLegacyPost, data)
}

export async function publishLegacyPost(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.publishLegacyPost, data)
}

export async function getLegacyPostCommentsPage(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPostCommentsPage, data)
}

export async function getLegacyPostCanvasComments(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPostCanvasComments, data)
}

export async function getLegacyPostTimelineEventsPage(
  accessToken: string,
  data: { slug: string; postId: string; after?: string; limit?: number }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPostTimelineEventsPage, data)
}

export async function getLegacyPostVersions(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPostVersions, data)
}

export async function getLegacyGeneratedPostResolution(
  accessToken: string,
  data: { slug: string; postId: string; commentId?: string }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyGeneratedPostResolution, data)
}

export async function getLegacyGeneratedPostTldr(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyGeneratedPostTldr, data)
}

export async function updateLegacyPostVisibility(
  accessToken: string,
  data: { slug: string; postId: string; visibility: 'default' | 'public' }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.updateLegacyPostVisibility, data)
}

export async function resolveLegacyPost(
  accessToken: string,
  data: { slug: string; postId: string; resolve_html?: string | null; comment_id?: string | null }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.resolveLegacyPost, data)
}

export async function unresolveLegacyPost(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.unresolveLegacyPost, data)
}

export async function getLegacyPostSeoInfo(accessToken: string, data: { slug: string; postId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPostSeoInfo, data)
}

export async function getLegacyPostViewsPage(
  accessToken: string,
  data: { slug: string; postId: string; after?: string }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPostViewsPage, data)
}

export async function createLegacyPostView(
  accessToken: string,
  data: {
    slug: string
    postId: string
    read: boolean
    skip_notifications?: boolean
    dwell_time?: number
    anonymized_ip?: string
    user_agent?: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.createLegacyPostView, data)
}

export async function getLegacyComment(accessToken: string, data: { slug: string; commentId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyCommentById, data)
}

export async function resolveLegacyComment(accessToken: string, data: { slug: string; commentId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.resolveLegacyComment, data)
}

export async function unresolveLegacyComment(accessToken: string, data: { slug: string; commentId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.unresolveLegacyComment, data)
}

export async function createLegacyPostComment(
  accessToken: string,
  data: {
    slug: string
    postId: string
    body_html?: string | null
    file_id?: string | null
    timestamp?: number | null
    x?: number | null
    y?: number | null
    note_highlight?: string | null
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
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.createLegacyPostComment, data)
}

export async function createLegacyCommentReply(
  accessToken: string,
  data: {
    slug: string
    commentId: string
    body_html?: string | null
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
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.createLegacyCommentReply, data)
}

export async function updateLegacyComment(
  accessToken: string,
  data: {
    slug: string
    commentId: string
    body_html?: string | null
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.updateLegacyComment, data)
}

export async function deleteLegacyComment(accessToken: string, data: { slug: string; commentId: string }) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.content.deleteLegacyComment, data)
}

export async function getLegacyAttachmentCommenters(
  accessToken: string,
  data: {
    slug: string
    attachmentId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyAttachmentCommenters, data)
}

export async function getLegacyAttachmentById(
  accessToken: string,
  data: {
    slug: string
    attachmentId: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyAttachmentById, data)
}

export async function getLegacyPostAttachmentCommentsPage(
  accessToken: string,
  data: {
    slug: string
    postId: string
    attachmentId: string
    after?: string
    limit?: number
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.query(api.content.getLegacyPostAttachmentCommentsPage, data)
}
