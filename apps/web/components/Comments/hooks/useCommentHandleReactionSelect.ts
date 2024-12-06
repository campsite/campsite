import { useCallback } from 'react'

import { Comment, SyncCustomReaction } from '@campsite/types'

import { useCreateCommentReaction } from '@/hooks/useCreateCommentReaction'
import { useCreatePostView } from '@/hooks/useCreatePostView'
import { useDeleteReaction } from '@/hooks/useDeleteReaction'
import { findGroupedReaction, StandardReaction } from '@/utils/reactions'

export function useCommentHandleReactionSelect({ comment, postId }: { comment: Comment; postId?: string }) {
  const { mutate: createReaction } = useCreateCommentReaction(comment.id)
  const { mutate: deleteReaction } = useDeleteReaction()
  const { mutate: createPostView } = useCreatePostView()

  return useCallback(
    (reaction: StandardReaction | SyncCustomReaction) => {
      if (!comment) return
      const groupedReaction = findGroupedReaction(comment.grouped_reactions, reaction)

      if (groupedReaction?.viewer_reaction_id) {
        deleteReaction({ id: groupedReaction.viewer_reaction_id, type: 'comment', commentId: comment.id })
      } else {
        createReaction({ reaction })

        if (postId) {
          createPostView({ postId, read: true })
        }
      }
    },
    [comment, deleteReaction, createReaction, postId, createPostView]
  )
}
