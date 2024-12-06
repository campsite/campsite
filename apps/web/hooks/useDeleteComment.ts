import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { Comment, CommentPage } from '@campsite/types'

import { activeNoteEditorAtom } from '@/components/Post/Notes/types'
import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedInfiniteQueriesData, setTypedQueriesData } from '@/utils/queryClient'
import { getNormalizedData, setNormalizedData } from '@/utils/queryNormalization'

type Props = {
  subject_id: string
  comment_id: string
  parent_id: string | null
}

const removeCommentFromPages = (comment_id: string) => (old: InfiniteData<CommentPage> | undefined) => {
  if (!old) return
  return {
    ...old,
    pages: old.pages.map((page) => {
      return {
        ...page,
        data: removeComment(page.data, comment_id)
      }
    })
  }
}

function removeComment(comments: Comment[] | undefined, id: string) {
  if (!comments) return []
  return comments.filter((comment) => comment.id !== id)
}

const mutation = apiClient.organizations.deleteCommentsById()

export function useDeleteComment({ subject_id, comment_id, parent_id }: Props) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const activeNodeEditor = useAtomValue(activeNoteEditorAtom)
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    mutationKey: mutation.requestKey(`${scope}`, comment_id),
    mutationFn: () => mutation.request(`${scope}`, comment_id, { headers: pusherSocketIdHeader }),
    onMutate: () => {
      if (parent_id) {
        setNormalizedData({
          queryNormalizer,
          type: 'comment',
          id: parent_id,
          update: (old) => {
            if (!old) return {}
            return {
              ...old,
              replies: removeComment(old.replies, comment_id)
            }
          }
        })
      } else {
        setTypedInfiniteQueriesData(
          queryClient,
          apiClient.organizations.getPostsComments().requestKey({ orgSlug: `${scope}`, postId: subject_id }),
          removeCommentFromPages(comment_id)
        )
        setTypedInfiniteQueriesData(
          queryClient,
          apiClient.organizations.getNotesComments().requestKey({ orgSlug: `${scope}`, noteId: subject_id }),
          removeCommentFromPages(comment_id)
        )

        const attachment_id = getNormalizedData({
          queryNormalizer,
          type: 'comment',
          id: comment_id
        })?.attachment_id

        if (attachment_id) {
          setTypedInfiniteQueriesData(
            queryClient,
            apiClient.organizations
              .getPostsAttachmentsComments()
              .requestKey({ orgSlug: `${scope}`, postId: subject_id, attachmentId: attachment_id }),
            removeCommentFromPages(comment_id)
          )
          setTypedInfiniteQueriesData(
            queryClient,
            apiClient.organizations
              .getNotesAttachmentsComments()
              .requestKey({ orgSlug: `${scope}`, noteId: subject_id, attachmentId: attachment_id }),
            removeCommentFromPages(comment_id)
          )
          setNormalizedData({
            queryNormalizer,
            type: 'attachment',
            id: attachment_id,
            update: (old) => ({ comments_count: (old.comments_count ?? 1) - 1 })
          })
        }

        setTypedQueriesData(
          queryClient,
          apiClient.organizations.getPostsCanvasComments().requestKey(`${scope}`, subject_id),
          (old) => removeComment(old, comment_id)
        )
      }

      activeNodeEditor?.commands.unsetComment(comment_id)
    },

    onSuccess: (previewCommenters) => {
      setNormalizedData({
        queryNormalizer,
        type: 'post',
        id: subject_id,
        update: (old) => ({
          comments_count: old.comments_count - 1,
          preview_commenters: previewCommenters
        })
      })
      setNormalizedData({
        queryNormalizer,
        type: 'note',
        id: subject_id,
        update: (old) => ({
          comments_count: old.comments_count - 1,
          preview_commenters: previewCommenters
        })
      })
    }
  })
}
