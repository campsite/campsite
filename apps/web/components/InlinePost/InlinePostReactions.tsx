import { Post, SyncCustomReaction } from '@campsite/types'
import { Button, FaceSmilePlusIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useCreatePostReaction } from '@/hooks/useCreatePostReaction'
import { useCreatePostView } from '@/hooks/useCreatePostView'
import { useDeleteReaction } from '@/hooks/useDeleteReaction'
import { findGroupedReaction, StandardReaction } from '@/utils/reactions'

import { Reactions } from '../Reactions'
import { ReactionPicker } from '../Reactions/ReactionPicker'

interface InlinePostReactionsProps {
  post: Post
}

export function InlinePostReactions({ post }: InlinePostReactionsProps) {
  const createReaction = useCreatePostReaction(post.id)
  const deleteReaction = useDeleteReaction()
  const createPostView = useCreatePostView()

  function handleCreateReaction(reaction: StandardReaction | SyncCustomReaction) {
    createReaction.mutate({ reaction })
    createPostView.mutate({ postId: post.id, read: true })
  }

  function handleDeleteReaction(id: string) {
    deleteReaction.mutate({ id, type: 'post', postId: post.id })
  }

  function handleReactionSelect(reaction: StandardReaction | SyncCustomReaction) {
    if (!post) return
    if (!post.viewer_is_organization_member) return null

    const groupedReaction = findGroupedReaction(post.grouped_reactions, reaction)

    if (groupedReaction?.viewer_reaction_id) {
      handleDeleteReaction(groupedReaction.viewer_reaction_id)
    } else {
      handleCreateReaction(reaction)
    }
  }

  function getClasses(hasReacted: boolean) {
    return cn(
      'flex gap-1.5 pointer-events-auto items-center p-1 pl-2 pr-2.5 justify-center group h-7.5 rounded-full text-xs font-semibold ring-1 min-w-[32px]',
      {
        'bg-blue-100/70 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-400':
          hasReacted,
        'bg-tertiary hover:bg-quaternary': !hasReacted,
        'cursor-pointer': post?.viewer_is_organization_member,
        'cursor-default': !post?.viewer_is_organization_member
      }
    )
  }

  if (!post) return null

  return (
    <>
      <ReactionPicker
        custom={!!post.viewer_is_organization_member}
        onReactionSelect={handleReactionSelect}
        trigger={
          <Button round variant='plain' iconOnly={<FaceSmilePlusIcon size={24} />} accessibilityLabel='Add reaction' />
        }
      />
      <Reactions reactions={post.grouped_reactions} onReactionSelect={handleReactionSelect} getClasses={getClasses} />
    </>
  )
}
