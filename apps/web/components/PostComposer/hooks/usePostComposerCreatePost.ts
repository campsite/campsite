import { useCallback } from 'react'

import { useCreatePost } from '@/hooks/useCreatePost'
import { trimHtml } from '@/utils/trimHtml'

import { PostSchema } from '../../Post/schema'

export function usePostComposerCreatePost() {
  const { mutateAsync: createPost } = useCreatePost()

  return useCallback(
    ({ editorHTML, data, draft }: { editorHTML: string; data: PostSchema; draft?: boolean }) =>
      createPost({
        ...data,
        description_html: trimHtml(editorHTML),
        // for inline attachments
        attachment_ids: data.attachment_ids,
        // for carousel attachments; will eventually deprecate this
        attachments: data.attachments.map((attachment) => ({
          file_path: attachment.optimistic_file_path ?? '',
          preview_file_path: attachment.optimistic_preview_file_path ?? '',
          imgix_video_file_path: attachment.optimistic_imgix_video_file_path || undefined,
          file_type: attachment.file_type,
          width: attachment.width,
          height: attachment.height,
          duration: attachment.duration,
          name: attachment.name,
          size: attachment.size,
          figma_file_id: attachment.figma_file_id,
          remote_figma_node_id: attachment.remote_figma_node_id,
          remote_figma_node_type: attachment.remote_figma_node_type,
          remote_figma_node_name: attachment.remote_figma_node_name,
          figma_share_url: attachment.figma_share_url
        })),
        poll: data.poll
          ? { ...data.poll, options: data.poll.options.map((o) => ({ description: o.description })) }
          : undefined,
        links: [],
        feedback_request_member_ids:
          data.status === 'feedback_requested' ? (data.feedback_requests?.map((fr) => fr.member.id) ?? []) : [],

        title: data.title,
        draft
      }),
    [createPost]
  )
}
