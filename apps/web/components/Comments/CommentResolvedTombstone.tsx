import { Comment } from '@campsite/types'
import { CheckIcon, ChevronSelectExpandIcon, ChevronSelectIcon, UIText } from '@campsite/ui'

interface CommentResolvedTombstoneProps {
  comment: Comment
  showResolvedComment: boolean
  setShowResolvedComment: (show: boolean) => void
}

export function CommentResolvedTombstone({
  comment,
  showResolvedComment,
  setShowResolvedComment
}: CommentResolvedTombstoneProps) {
  return (
    <div className='flex p-1'>
      <button
        onClick={() => setShowResolvedComment(!showResolvedComment)}
        className='hover:bg-tertiary bg-primary dark:bg-secondary dark:hover:bg-tertiary group flex flex-1 items-center gap-3 rounded-md p-2'
      >
        <CheckIcon className='text-green-500' size={24} />

        <UIText tertiary>
          <span className='text-primary'>{`${comment.resolved_by?.user.display_name}`}</span> resolved this thread
        </UIText>

        <span className='text-quaternary group-hover:text-tertiary ml-auto'>
          {showResolvedComment ? <ChevronSelectExpandIcon /> : <ChevronSelectIcon />}
        </span>
      </button>
    </div>
  )
}
