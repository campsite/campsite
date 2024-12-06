import { useMutation, useQueryClient } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'

import { OrganizationMember } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, getTypedQueryData, setTypedInfiniteQueriesData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

interface Props {
  postId: string
  optionId: string
}

export function useCreatePollVote() {
  const queryClient = useQueryClient()
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ postId, optionId }: Props) =>
      apiClient.organizations.postPostsPoll2OptionsVote().request(`${scope}`, postId, optionId),
    onMutate: async ({ postId, optionId }) => {
      const optimisticUpdate = createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'post',
        id: postId,
        update: (old) => {
          if (!old.poll) return {}
          const newVotesCount = old.poll.votes_count + 1

          return {
            poll: {
              ...old.poll,
              viewer_voted: true,
              votes_count: newVotesCount,
              options: old.poll?.options.map((option) => {
                if (option.id === optionId) {
                  return {
                    ...option,
                    votes_count: option.votes_count + 1,
                    viewer_voted: true,
                    votes_percent: Math.round(((option.votes_count + 1) / newVotesCount) * 100)
                  }
                }

                return {
                  ...option,
                  votes_percent: Math.round((option.votes_count / newVotesCount) * 100)
                }
              })
            }
          }
        }
      })

      const optimisticVoterId = uuid()
      const currentUser = getTypedQueryData(queryClient, apiClient.users.getMe().requestKey())

      if (currentUser) {
        setTypedInfiniteQueriesData(
          queryClient,
          apiClient.organizations
            .getPostsPollOptionsVoters()
            .requestKey({ orgSlug: `${scope}`, postId, pollOptionId: optionId }),
          (old) => {
            const tempVoter: OrganizationMember = {
              id: optimisticVoterId,
              role: 'member',
              created_at: new Date().toISOString(),
              deactivated: false,
              user: { ...currentUser, type_name: 'user' },
              is_organization_member: true,
              status: null
            }

            if (!old) {
              return {
                pages: [{ data: [tempVoter], total_count: 1 }],
                pageParams: []
              }
            }

            return {
              ...old,
              pages: [...old.pages, { data: [tempVoter], total_count: old.pages[0].total_count + 1 }]
            }
          }
        )
      }

      return { ...optimisticUpdate, optimisticVoterId }
    },
    onError(_err, { postId, optionId }, context) {
      if (context?.optimisticVoterId) {
        setTypedInfiniteQueriesData(
          queryClient,
          apiClient.organizations
            .getPostsPollOptionsVoters()
            .requestKey({ orgSlug: `${scope}`, postId, pollOptionId: optionId }),
          (old) => {
            if (!old) return

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((voter) => voter.id !== context.optimisticVoterId)
              }))
            }
          }
        )
      }
    }
  })
}
