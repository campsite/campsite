import { useCallback } from 'react'

import { Comment, SyncCustomReaction } from '@campsite/types'
import { Button, FaceSmilePlusIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { StandardReaction } from '@/utils/reactions'

import { Reactions } from '../Reactions'
import { ReactionPicker } from '../Reactions/ReactionPicker'

interface Props {
  comment: Comment
  onReactionSelect: (reaction: StandardReaction | SyncCustomReaction) => void
}

export function CommentReactions({ comment, onReactionSelect }: Props) {
  function getClasses(hasReacted: boolean) {
    return cn(
      'flex gap-[5px] pointer-events-auto items-center p-0.5 pl-1.5 pr-2 justify-center group h-6.5 rounded-full text-xs font-semibold ring-1 min-w-[32px]',
      {
        'bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-400':
          hasReacted,
        'bg-tertiary hover:bg-quaternary': !hasReacted,
        'cursor-pointer': comment.viewer_can_react,
        'cursor-default': !comment.viewer_can_react
      }
    )
  }

  const handleReactionSelect = useCallback(
    (reaction: StandardReaction | SyncCustomReaction) => {
      if (!comment.viewer_can_react) return null

      onReactionSelect(reaction)
    },
    [comment.viewer_can_react, onReactionSelect]
  )

  if (!comment.grouped_reactions.length) return null

  return (
    <div className='-ml-1 flex flex-wrap items-center gap-1'>
      {comment.viewer_can_react && (
        <ReactionPicker
          custom
          trigger={
            <Button
              className='hover:text-primary text-tertiary px-0.5'
              round
              size='sm'
              variant='plain'
              iconOnly={<FaceSmilePlusIcon />}
              accessibilityLabel='Add reaction'
            />
          }
          onReactionSelect={handleReactionSelect}
        />
      )}
      <Reactions
        reactions={comment.grouped_reactions}
        onReactionSelect={handleReactionSelect}
        getClasses={getClasses}
      />
    </div>
  )
}
