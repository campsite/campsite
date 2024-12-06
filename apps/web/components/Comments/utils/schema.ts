import { z } from 'zod'

import { Attachment, Comment } from '@campsite/types'

import { EMPTY_HTML } from '@/atoms/markdown'

export const commentSchema = z.object({
  body_html: z.string(),
  attachments: z.array(z.any() as unknown as z.Schema<Attachment>),
  attachment_ids: z.array(z.string()),
  file_id: z.string().optional().nullable(),
  x: z.number().optional().nullable(),
  y: z.number().optional().nullable(),
  note_highlight: z.string().optional().nullable()
})

export type CommentSchema = z.infer<typeof commentSchema>

export const commentDefaultValues: CommentSchema = {
  body_html: EMPTY_HTML,
  attachments: [],
  attachment_ids: [],
  file_id: null,
  x: null,
  y: null,
  note_highlight: null
}

export function getDefaultValues(comment: Partial<Comment> | undefined): CommentSchema {
  if (!comment) {
    return { ...commentDefaultValues }
  }

  return {
    body_html: comment.body_html || commentDefaultValues.body_html,
    attachments: comment.attachments || commentDefaultValues.attachments,
    attachment_ids: comment.attachments?.map((a) => a.id) || commentDefaultValues.attachment_ids,
    file_id: comment.attachment_id || commentDefaultValues.file_id,
    x: comment.x || commentDefaultValues.x,
    y: comment.y || commentDefaultValues.y,
    note_highlight: comment.note_highlight || commentDefaultValues.note_highlight
  }
}
