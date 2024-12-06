import { useMutation } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'

import { Comment } from '@campsite/types/generated'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { apiClient } from '@/utils/queryClient'
import { trimHtml } from '@/utils/trimHtml'

import { CreateCommentData, updateCommentStateAtom, useCreateCommentCallbacks } from './useCreateCommentCallbacks'

interface Props {
  subjectId: string
  subjectType: 'post' | 'note'
  onOptimisticCreate?: () => void
  onServerCreate?: (comment: Comment) => void
}

export function useCreateComment({ subjectId, subjectType, onOptimisticCreate, onServerCreate }: Props) {
  const { scope, onMutate, onSuccess, onError } = useCreateCommentCallbacks({
    subjectId,
    subjectType,
    onOptimisticCreate,
    onServerCreate
  })
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    scope: { id: 'create-comment' },
    mutationFn: ({ transformedFiles: _, ...data }: CreateCommentData) => {
      data.body_html = data.body_html ? trimHtml(data.body_html) : null

      if (subjectType === 'post') {
        return apiClient.organizations.postPostsComments2().request(`${scope}`, subjectId, data, {
          headers: pusherSocketIdHeader
        })
      } else {
        return apiClient.organizations
          .postNotesComments()
          .request(`${scope}`, subjectId, data, { headers: pusherSocketIdHeader })
      }
    },
    onMutate,
    onSuccess: (response, data, { optimisticId }) => {
      onSuccess({
        optimisticId,
        transformedFiles: data.transformedFiles,
        newComment: response.post_comment,
        latestCommenters: response.preview_commenters.latest_commenters,
        attachment: response.attachment,
        attachmentCommenters: response.attachment_commenters
      })
    },
    onError: (_err, _vars, context) => {
      onError(context?.optimisticId)
    }
  })
}

interface RetryProps {
  subjectId: string
  subjectType: 'post' | 'note'
}

type RetryMutationProps = CreateCommentData & { optimisticId: string }

export function useRetryCreateComment({ subjectId, subjectType }: RetryProps) {
  const updateMutation = useSetAtom(updateCommentStateAtom)
  const { scope, onSuccess, onError } = useCreateCommentCallbacks({
    subjectId,
    subjectType
  })
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    mutationFn: ({ optimisticId: _, ...data }: RetryMutationProps) => {
      data.body_html = data.body_html ? trimHtml(data.body_html) : null

      if (subjectType === 'post') {
        return apiClient.organizations.postPostsComments2().request(`${scope}`, subjectId, data, {
          headers: pusherSocketIdHeader
        })
      } else {
        return apiClient.organizations
          .postNotesComments()
          .request(`${scope}`, subjectId, data, { headers: pusherSocketIdHeader })
      }
    },
    onMutate: async ({ optimisticId }) => {
      updateMutation({ optimisticId, status: 'pending' })
    },
    onSuccess: (response, { optimisticId, ...data }) => {
      onSuccess({
        optimisticId,
        transformedFiles: data.transformedFiles,
        newComment: response.post_comment,
        latestCommenters: response.preview_commenters.latest_commenters,
        attachment: response.attachment,
        attachmentCommenters: response.attachment_commenters
      })
    },
    onError: (_, { optimisticId }) => {
      onError(optimisticId)
    }
  })
}
