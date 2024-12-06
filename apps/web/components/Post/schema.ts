import deepEqual from 'fast-deep-equal'
import { DeepPartialSkipArrayKey } from 'react-hook-form'
import { z } from 'zod'

import { Attachment, Post } from '@campsite/types'

import { EMPTY_HTML } from '@/atoms/markdown'
import { trimHtml } from '@/utils/trimHtml'

export const postSchema = z.object({
  description_html: z.string(),
  unfurled_link: z.string().nullable(),
  project_id: z.string().optional(),
  // for carousel attachments; will eventually deprecate this
  attachments: z.array(
    z.any() as unknown as z.Schema<
      Attachment & {
        figma_file_id?: number
        remote_figma_node_id?: string
        remote_figma_node_type?: string
        remote_figma_node_name?: string
        figma_share_url?: string
      }
    >
  ),
  // for inline attachments
  attachment_ids: z.array(z.string()),
  poll: z
    .object({
      id: z.string().optional(),
      description: z.string(),
      options: z.array(
        z.object({
          id: z.string(),
          description: z.string(),
          new: z.boolean().optional()
        })
      )
    })
    .nullable(),
  status: z.enum(['none', 'feedback_requested']),
  feedback_requests: z
    .array(
      z.object({
        id: z.string(),
        has_replied: z.boolean(),
        member: z.any()
      })
    )
    .nullable(),
  tags: z.array(z.string()),
  parent_id: z.string().optional().nullable(),
  note_id: z.string().optional().nullable(),
  from_message_id: z.string().optional().nullable(),
  title: z.string().optional()
})

export type PostSchema = z.infer<typeof postSchema>

export const postDefaultValues: PostSchema = {
  description_html: EMPTY_HTML,
  unfurled_link: null,
  // for carousel attachments; will eventually deprecate this
  attachments: [],
  // for inline attachments
  attachment_ids: [],
  poll: null,
  status: 'none',
  feedback_requests: null,
  tags: [],
  title: ''
}

export function getPostSchemaDefaultValues(post?: Post, initialProjectId?: string): PostSchema {
  const project_id = post?.project?.id || initialProjectId || postDefaultValues.project_id

  if (!post) {
    return { ...postDefaultValues, project_id }
  }
  return {
    project_id,
    description_html: post.description_html || postDefaultValues.description_html,
    unfurled_link: post.unfurled_link || postDefaultValues.unfurled_link,
    // for carousel attachments; will eventually deprecate this
    attachments: post.attachments || postDefaultValues.attachments,
    // for inline attachments
    attachment_ids: post.attachments.map((a) => a.id) || postDefaultValues.attachment_ids,
    poll: post.poll || postDefaultValues.poll,
    status: post.status || postDefaultValues.status,
    feedback_requests: post.feedback_requests || postDefaultValues.feedback_requests,
    tags: post?.tags.map((t) => t.name) || postDefaultValues.tags,
    title: post.title || postDefaultValues.title
  }
}

export function postFormHasChanges({
  isDirty,
  isValidating,
  isValid,
  watched,
  previous
}: {
  isDirty: boolean
  isValidating: boolean
  isValid: boolean
  watched: DeepPartialSkipArrayKey<PostSchema>
  previous: DeepPartialSkipArrayKey<PostSchema>
}) {
  return isDirty && !isValidating && isValid && !deepEqual(watched, previous)
}

export function postFormIsEmpty(post: PostSchema) {
  const trimmedDescriptionHtml = trimHtml(post.description_html)
  const isDescriptionEmpty = !trimmedDescriptionHtml || trimmedDescriptionHtml === EMPTY_HTML

  return (
    isDescriptionEmpty &&
    !post.attachments.length &&
    !post.unfurled_link &&
    !post.feedback_requests?.length &&
    !post.poll &&
    !post.tags.length &&
    !post.title
  )
}
