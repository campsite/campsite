import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import toast from 'react-hot-toast'

import { selectedCanvasCommentIdAtom } from '@/components/CanvasComments/CanvasComments'
import { activeNoteEditorAtom } from '@/components/Post/Notes/types'
import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, getTypedQueryData } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

type Props = {
  commentId: string
  subjectId: string
  subjectType: 'post' | 'note'
}

export function useResolveComment() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const activeNodeEditor = useAtomValue(activeNoteEditorAtom)
  const setSelectedCanvasCommentId = useSetAtom(selectedCanvasCommentIdAtom)

  return useMutation({
    mutationFn: ({ commentId }: Props) =>
      apiClient.organizations.postCommentsResolutions().request(`${scope}`, commentId),
    onSuccess: () => {
      toast('Comment resolved')
    },
    onMutate: ({ commentId, subjectId, subjectType }) => {
      setSelectedCanvasCommentId(undefined)

      const currentUser = getTypedQueryData(queryClient, apiClient.users.getMe().requestKey())

      if (!currentUser) return

      setNormalizedData({
        queryNormalizer,
        type: 'comment',
        id: commentId,
        update: (old) => ({
          ...old,
          resolved_at: new Date().toISOString(),
          resolved_by: {
            id: `temp-${Math.random()}`,
            role: 'member' as const,
            created_at: new Date().toISOString(),
            deactivated: false,
            user: { ...currentUser, type_name: 'user' },
            is_organization_member: true,
            status: null
          }
        })
      })

      if (subjectType === 'post') {
        setNormalizedData({
          queryNormalizer,
          type: 'post',
          id: subjectId,
          update: (old) => ({
            resolved_comments_count: old.resolved_comments_count + 1
          })
        })
      } else if (subjectType === 'note') {
        setNormalizedData({
          queryNormalizer,
          type: 'note',
          id: subjectId,
          update: (old) => ({
            resolved_comments_count: old.resolved_comments_count + 1
          })
        })
      }

      activeNodeEditor?.commands.unsetComment(commentId)
    }
  })
}
