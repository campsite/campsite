import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { OrganizationsOrgSlugCommentsIdPutRequest } from '@campsite/types'

import { EMPTY_HTML } from '@/atoms/markdown'
import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

type Props = OrganizationsOrgSlugCommentsIdPutRequest & {
  commentId: string
}

export function useUpdateComment(showToast: boolean = true) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ commentId, ...data }: Props) =>
      apiClient.organizations.putCommentsById().request(`${scope}`, commentId, data),
    onMutate: ({ commentId, ...data }) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'comment',
        id: commentId,
        update: { body_html: data.body_html ?? EMPTY_HTML }
      })
    },
    onSuccess: () => {
      if (showToast) {
        toast('Comment updated')
      }
    }
  })
}
