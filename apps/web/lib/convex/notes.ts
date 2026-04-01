import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

function getNotesClient(accessToken?: string | null) {
  return getConvexServerClient(accessToken)
}

export async function getLegacyNotesPage(
  accessToken: string,
  data: {
    slug: string
    after?: string
    limit?: number
    q?: string
    projectId?: string
    mode?: 'all' | 'for_me' | 'viewer'
    order?: {
      by: 'created_at' | 'last_activity_at'
      direction: 'asc' | 'desc'
    }
  }
) {
  return await getNotesClient(accessToken).action(api.notes.getLegacyNotesPage, data)
}

export async function promoteLegacyNotesCompat(accessToken: string, data: { slug: string }) {
  return await getNotesClient(accessToken).mutation(api.notes.promoteLegacyNotesCompat, data)
}

export async function getLegacyNote(accessToken: string, data: { slug: string; noteId: string }) {
  return await getNotesClient(accessToken).action(api.notes.getLegacyNoteById, data)
}

export async function getLegacyDigestMigration(accessToken: string, data: { slug: string; digestId: string }) {
  return await getNotesClient(accessToken).query(api.digests.getLegacyDigestMigration, data)
}

export async function createLegacyNote(
  accessToken: string,
  data: {
    slug: string
    title?: string
    description_html?: string
    project_id?: string
  }
) {
  return await getNotesClient(accessToken).action(api.notes.createLegacyNote, data)
}

export async function updateLegacyNote(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    title?: string
  }
) {
  return await getNotesClient(accessToken).action(api.notes.updateLegacyNote, data)
}

export async function deleteLegacyNote(accessToken: string, data: { slug: string; noteId: string }) {
  return await getNotesClient(accessToken).action(api.notes.deleteLegacyNote, data)
}

export async function getLegacyNoteCommentsPage(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    after?: string
    limit?: number
  }
) {
  return await getNotesClient(accessToken).action(api.notes.getLegacyNoteCommentsPage, data)
}

export async function createLegacyNoteComment(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    attachment_ids?: string[]
    attachments?: {
      file_path: string
      file_type: string
      preview_file_path?: string | null
      width?: number
      height?: number
      duration?: number
      name?: string | null
      size?: number | null
    }[]
    body_html?: string | null
    file_id?: string | null
    note_highlight?: string | null
    parent_comment_id?: string | null
    timestamp?: number | null
    x?: number | null
    y?: number | null
  }
) {
  return await getNotesClient(accessToken).action(api.notes.createLegacyNoteComment, data)
}

export async function getLegacyNoteAttachmentCommentsPage(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    attachmentId: string
    after?: string
    limit?: number
  }
) {
  return await getNotesClient(accessToken).action(api.notes.getLegacyNoteAttachmentCommentsPage, data)
}

export async function createLegacyNoteAttachment(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    duration?: number
    file_path: string
    file_type: string
    gallery_id?: string | null
    height?: number
    name?: string | null
    no_video_track?: boolean
    position: number
    preview_file_path?: string | null
    size?: number | null
    width?: number
  }
) {
  return await getNotesClient(accessToken).action(api.notes.createLegacyNoteAttachment, data)
}

export async function getLegacyNotePermissions(accessToken: string, data: { slug: string; noteId: string }) {
  return await getNotesClient(accessToken).action(api.notes.getLegacyNotePermissions, data)
}

export async function createLegacyNotePermissions(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    member_ids: string[]
    permission: 'view' | 'edit'
  }
) {
  return await getNotesClient(accessToken).action(api.notes.createLegacyNotePermissions, data)
}

export async function updateLegacyNotePermission(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    permissionId: string
    permission: 'view' | 'edit'
  }
) {
  return await getNotesClient(accessToken).action(api.notes.updateLegacyNotePermission, data)
}

export async function deleteLegacyNotePermission(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    permissionId: string
  }
) {
  return await getNotesClient(accessToken).action(api.notes.deleteLegacyNotePermission, data)
}

export async function updateLegacyNoteProjectPermission(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    project_id: string
    permission: 'view' | 'edit'
  }
) {
  return await getNotesClient(accessToken).action(api.notes.updateLegacyNoteProjectPermission, data)
}

export async function deleteLegacyNoteProjectPermission(accessToken: string, data: { slug: string; noteId: string }) {
  return await getNotesClient(accessToken).action(api.notes.deleteLegacyNoteProjectPermission, data)
}

export async function getLegacyPublicNote(accessToken: string | null | undefined, data: { slug: string; noteId: string }) {
  return await getNotesClient(accessToken).action(api.notes.getLegacyPublicNote, data)
}

export async function getLegacyNoteSyncState(accessToken: string, data: { slug: string; noteId: string }) {
  return await getNotesClient(accessToken).action(api.notes.getLegacyNoteSyncState, data)
}

export async function createLegacyNoteSyncGrant(
  accessToken: string,
  data: { slug: string; noteId: string; resourceType: 'Note' }
) {
  return await getNotesClient(accessToken).mutation(api.notes.createLegacyNoteSyncGrant, data)
}

export async function getLegacyNoteSyncStateByGrant(data: { grantId: string; slug: string; noteId: string }) {
  return await getNotesClient(null).action(api.notes.getLegacyNoteSyncStateByGrant, data)
}

export async function updateLegacyNoteSyncState(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    description_html: string
    description_state: string
    description_schema_version: number
  }
) {
  return await getNotesClient(accessToken).action(api.notes.updateLegacyNoteSyncState, data)
}

export async function updateLegacyNoteSyncStateByGrant(
  data: {
    grantId: string
    slug: string
    noteId: string
    description_html: string
    description_state: string
    description_schema_version: number
  }
) {
  return await getNotesClient(null).action(api.notes.updateLegacyNoteSyncStateByGrant, data)
}

export async function getLegacyNoteTimelineEventsPage(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    after?: string
    limit?: number
  }
) {
  return await getNotesClient(accessToken).action(api.notes.getLegacyNoteTimelineEventsPage, data)
}

export async function getLegacyNoteViews(accessToken: string, data: { slug: string; noteId: string }) {
  return await getNotesClient(accessToken).action(api.notes.getLegacyNoteViews, data)
}

export async function createLegacyNoteView(
  accessToken: string | null | undefined,
  data: { slug: string; noteId: string; anonymized_ip?: string; user_agent?: string }
) {
  return await getNotesClient(accessToken).action(api.notes.createLegacyNoteView, data)
}

export async function updateLegacyNoteVisibility(
  accessToken: string,
  data: {
    slug: string
    noteId: string
    visibility: 'default' | 'public'
  }
) {
  return await getNotesClient(accessToken).action(api.notes.updateLegacyNoteVisibility, data)
}

export async function createLegacyNotePin(accessToken: string, data: { slug: string; noteId: string }) {
  return await getNotesClient(accessToken).action(api.notes.createLegacyNotePin, data)
}
