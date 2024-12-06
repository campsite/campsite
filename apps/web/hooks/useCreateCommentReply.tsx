import { useMutation } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'

import { Comment } from '@campsite/types/generated'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { apiClient } from '@/utils/queryClient'
import { trimHtml } from '@/utils/trimHtml'

import { CreateReplyData, updateCommentStateAtom, useCreateCommentCallbacks } from './useCreateCommentCallbacks'

interface Props {
  subjectId: string
  subjectType: 'post' | 'note'
  onOptimisticCreate?: () => void
  onServerCreate?: (comment: Comment) => void
}

export function useCreateCommentReply({ subjectId, subjectType, onOptimisticCreate, onServerCreate }: Props) {
  const { scope, onMutate, onSuccess, onError } = useCreateCommentCallbacks({
    subjectId,
    subjectType,
    onOptimisticCreate,
    onServerCreate
  })
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    scope: { id: 'create-comment-reply' },
    mutationFn: ({ parentCommentId, transformedFiles: _, ...data }: CreateReplyData) => {
      data.body_html = data.body_html ? trimHtml(data.body_html) : null

      return apiClient.organizations.postCommentsReplies().request(`${scope}`, parentCommentId, data, {
        headers: pusherSocketIdHeader
      })
    },
    onMutate,
    onSuccess(response, data, { optimisticId }) {
      onSuccess({
        optimisticId,
        transformedFiles: data.transformedFiles,
        newComment: response.reply,
        attachment: response.attachment,
        attachmentCommenters: response.attachment_commenters
      })
    },
    onError: (_err, _vars, context) => onError(context?.optimisticId)
  })
}

interface RetryProps {
  subjectId: string
  subjectType: 'post' | 'note'
}

type RetryMutationProps = CreateReplyData & { optimisticId: string }

export function useRetryCreateReply({ subjectId, subjectType }: RetryProps) {
  const updateMutation = useSetAtom(updateCommentStateAtom)
  const { scope, onSuccess, onError } = useCreateCommentCallbacks({
    subjectId,
    subjectType
  })
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    mutationFn: ({ optimisticId: _, parentCommentId, ...data }: RetryMutationProps) => {
      data.body_html = data.body_html ? trimHtml(data.body_html) : null

      return apiClient.organizations.postCommentsReplies().request(`${scope}`, parentCommentId, data, {
        headers: pusherSocketIdHeader
      })
    },
    onMutate: async ({ optimisticId }) => {
      updateMutation({ optimisticId, status: 'pending' })
    },
    onSuccess: (response, { optimisticId, ...data }) => {
      onSuccess({
        optimisticId,
        transformedFiles: data.transformedFiles,
        newComment: response.reply,
        attachment: response.attachment,
        attachmentCommenters: response.attachment_commenters
      })
    },
    onError: (_, { optimisticId }) => {
      onError(optimisticId)
    }
  })
}
