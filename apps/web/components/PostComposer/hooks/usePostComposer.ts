import { useCallback } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'react-hot-toast'

import { Attachment, Call, Comment, Message, Note, Post } from '@campsite/types/generated'
import { shortTimestamp } from '@campsite/ui/RelativeTime'

import { getPostSchemaDefaultValues, postDefaultValues } from '@/components/Post/schema'
import { useDefaultComposerValues } from '@/components/PostComposer/hooks/useDefaultComposerValues'
import { usePostComposerLocalDraftValue } from '@/components/PostComposer/hooks/usePostComposerLocalDraft'
import { usePostComposerPresentation } from '@/components/PostComposer/hooks/usePostComposerPresentation'
import {
  PostComposerPresentation,
  postComposerStateAtom,
  PostComposerSuccessBehavior,
  PostComposerType
} from '@/components/PostComposer/utils'
import { useCreateAttachment } from '@/hooks/useCreateAttachment'
import { createMentionHtml } from '@/utils/createMentionHtml'

type ShowPostComposerArgs = {
  successBehavior?: PostComposerSuccessBehavior
  projectId?: string
} & (
  | {
      type: PostComposerType.EditPost
      post: Post
    }
  | {
      type: PostComposerType.EditDraftPost
      post: Post
    }
  | {
      type?: PostComposerType.Draft
    }
  | {
      type: PostComposerType.DraftFromPost
      post: Post
    }
  | {
      type: PostComposerType.DraftFromNote
      note: Note
    }
  | {
      type: PostComposerType.DraftFromCall
      call: Call
    }
  | {
      type: PostComposerType.DraftFromMessage
      message: Message
    }
  | {
      type: PostComposerType.DraftFromComment
      comment: Comment
    }
  | {
      type: PostComposerType.DraftFromText
      title: string
      body: string
    }
)

export function usePostComposer() {
  const { mutateAsync: createAttachment } = useCreateAttachment()
  const { defaultProjectId } = useDefaultComposerValues()
  const { localDraft } = usePostComposerLocalDraftValue()
  const { setPostComposerPresentation } = usePostComposerPresentation()
  const [postComposerState, setPostComposerState] = useAtom(postComposerStateAtom)

  const showPostComposer = useCallback(
    async ({
      successBehavior = PostComposerSuccessBehavior.Toast,
      projectId: project_id = defaultProjectId,
      ...props
    }: ShowPostComposerArgs = {}) => {
      if (postComposerState) {
        toast('Post composer already open')
        return
      }

      switch (props.type) {
        case PostComposerType.EditPost:
        case PostComposerType.EditDraftPost: {
          const { type, post } = props

          // Reset the presentation to dialog when editing a post
          setPostComposerPresentation(PostComposerPresentation.Dialog)

          setPostComposerState({
            type,
            successBehavior,
            defaultValues: getPostSchemaDefaultValues(post, project_id),
            initialPost: post
          })
          break
        }

        case PostComposerType.DraftFromPost: {
          const { type, post } = props

          setPostComposerState({
            type,
            successBehavior,
            defaultValues: {
              ...getPostSchemaDefaultValues(post),
              attachments: [],
              parent_id: post.id
            }
          })
          break
        }

        case PostComposerType.DraftFromNote: {
          const { type, note } = props

          setPostComposerState({
            type,
            successBehavior,
            defaultValues: {
              ...postDefaultValues,
              project_id: note.project?.id ?? project_id,
              title: note.title,
              note_id: note.id,
              unfurled_link: note.url
            }
          })
          break
        }

        case PostComposerType.DraftFromCall: {
          const { type, call } = props

          setPostComposerState({
            type,
            successBehavior,
            defaultValues: {
              ...postDefaultValues,
              project_id: call.project?.id ?? project_id,
              title: call.title ?? `Call summary · ${shortTimestamp(call.created_at)}`,
              unfurled_link: call.url
            }
          })
          break
        }

        case PostComposerType.DraftFromComment: {
          const { type, comment } = props

          setPostComposerState({
            type,
            successBehavior,
            defaultValues: {
              ...postDefaultValues,
              project_id,
              description_html: `<link-unfurl href="${comment.url}"</link-unfurl><p></p>`
            }
          })
          break
        }

        case PostComposerType.DraftFromMessage: {
          const { type, message } = props

          const mentionHtml = createMentionHtml({
            userId: message.sender.user.id,
            displayName: message.sender.user.display_name,
            username: message.sender.user.username,
            role: 'member'
          })

          try {
            const copied_attachments: Attachment[] = Array(message.attachments.length)

            await Promise.all(
              message.attachments.map(async (message_attachment, index) => {
                await createAttachment({
                  ...message_attachment,
                  file_path: message_attachment.relative_url
                }).then((attachment_copy) => {
                  copied_attachments[index] = attachment_copy
                })
              })
            )

            setPostComposerState({
              type,
              successBehavior,
              defaultValues: {
                ...postDefaultValues,
                project_id,
                description_html: `<p>${mentionHtml} ${message.content.length > 0 ? `said:</p><blockquote>${message.content}</blockquote>` : 'shared:'} ${message.attachments.length == 0 ? '<p></p>' : ''}`,
                from_message_id: message.id,
                attachments: copied_attachments
              }
            })
          } catch {
            toast.error('Failed to share message as post')
          }

          break
        }

        case PostComposerType.Draft:
        default: {
          setPostComposerState({
            type: PostComposerType.Draft,
            successBehavior,
            defaultValues: localDraft
              ? { ...localDraft, project_id }
              : getPostSchemaDefaultValues(undefined, project_id)
          })
          break
        }

        case PostComposerType.DraftFromText: {
          const { type, title, body } = props

          setPostComposerState({
            type,
            successBehavior,
            defaultValues: {
              ...getPostSchemaDefaultValues(undefined, project_id),
              title,
              description_html: body
            }
          })

          break
        }
      }
    },
    [
      defaultProjectId,
      postComposerState,
      setPostComposerPresentation,
      setPostComposerState,
      createAttachment,
      localDraft
    ]
  )

  return {
    showPostComposer
  }
}
