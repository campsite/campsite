import { JSONContent } from '@tiptap/core'

export const EMPTY_HTML = '<p></p>'
export const EMPTY_JSON: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph'
    }
  ]
}

type Props = {
  postId?: string
  replyingToCommentId?: string
  attachmentId?: string
}

export function draftKey({ postId, replyingToCommentId, attachmentId }: Props) {
  const subjectId = replyingToCommentId ?? attachmentId ?? postId
  const subjectType = replyingToCommentId ? 'reply' : attachmentId ? 'attachment' : 'post'

  return `html-${subjectType}-${subjectId}`
}
