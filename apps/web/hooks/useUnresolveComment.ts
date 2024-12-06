import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

type Props = {
  commentId: string
  subjectId: string
  subjectType: 'post' | 'note'
}

export function useUnresolveComment() {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ commentId }: Props) =>
      apiClient.organizations.deleteCommentsResolutions().request(`${scope}`, commentId),
    onSuccess: () => {
      toast('Comment unresolved')
    },
    onMutate: ({ commentId, subjectId, subjectType }) => {
      setNormalizedData({
        queryNormalizer,
        type: 'comment',
        id: commentId,
        update: (old) => ({
          ...old,
          resolved_at: null,
          resolved_by: null
        })
      })

      if (subjectType === 'post') {
        setNormalizedData({
          queryNormalizer,
          type: 'post',
          id: subjectId,
          update: (old) => ({
            resolved_comments_count: old.resolved_comments_count - 1
          })
        })
      } else if (subjectType === 'note') {
        setNormalizedData({
          queryNormalizer,
          type: 'note',
          id: subjectId,
          update: (old) => ({
            resolved_comments_count: old.resolved_comments_count - 1
          })
        })
      }
    }
  })
}
