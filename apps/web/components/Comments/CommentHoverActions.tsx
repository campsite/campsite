import { useEffect, useMemo, useState } from 'react'
import { atom, useAtomValue } from 'jotai'
import { useFocusVisible } from 'react-aria'
import toast from 'react-hot-toast'

import { Comment } from '@campsite/types'
import { Button, cn, FaceSmilePlusIcon, LazyLoadingSpinner, WarningTriangleIcon } from '@campsite/ui'

import { useCanHover } from '@/hooks/useCanHover'
import { useRetryCreateComment } from '@/hooks/useCreateComment'
import { createCommentStateAtom, CreateReplyData } from '@/hooks/useCreateCommentCallbacks'
import { useRetryCreateReply } from '@/hooks/useCreateCommentReply'

import { ReactionPicker } from '../Reactions/ReactionPicker'
import { CommentOverflowDropdown } from './CommentOverflowDropdown'
import { CommentResolveButton } from './CommentResolveButton'
import { useCommentHandleReactionSelect } from './hooks/useCommentHandleReactionSelect'

interface CommentHoverActionsProps {
  comment: Comment
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  isInCanvas?: boolean
  subjectId: string
  subjectType: 'post' | 'note'
  canResolvePost?: boolean
  canUnresolvePost?: boolean
}

export function CommentHoverActions(props: CommentHoverActionsProps) {
  if (props.comment.id === props.comment.optimistic_id) {
    return (
      <CommentStatusActions
        subjectId={props.subjectId}
        subjectType={props.subjectType}
        optimisticId={props.comment.optimistic_id}
      />
    )
  }
  return <InnerCommentHoverActions {...props} />
}

interface StatusProps {
  subjectId: string
  subjectType: 'post' | 'note'
  optimisticId: string
  isInCanvas?: boolean
}

function isCreateReplyData(data: any): data is CreateReplyData {
  return 'parentCommentId' in data
}

function CommentStatusActions({ subjectId, subjectType, optimisticId, isInCanvas }: StatusProps) {
  const { isFocusVisible } = useFocusVisible()
  const state = useAtomValue(useMemo(() => atom((get) => get(createCommentStateAtom)[optimisticId]), [optimisticId]))
  const retryComment = useRetryCreateComment({ subjectId, subjectType })
  const retryReply = useRetryCreateReply({ subjectId, subjectType })
  const [showPending, setShowPending] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setShowPending(true), 2000)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  if (!state) return null

  const isVisible = state.status === 'error' || (state.status === 'pending' && showPending)

  return (
    <div
      className={cn(
        'initial:opacity-0 flex flex-none items-center justify-end rounded-lg p-0.5 transition-opacity group-hover:opacity-100 [&:has(button[aria-expanded="true"])]:opacity-100 [@media(hover:none)]:opacity-100',
        {
          'focus-within:opacity-100': isFocusVisible,
          'opacity-100': isVisible,
          '-mr-[7px]': isInCanvas
        }
      )}
    >
      {state.status === 'pending' && (
        <div className='w-7.5 h-7.5 flex items-center justify-center'>
          <LazyLoadingSpinner delay={1000} />
        </div>
      )}
      {state.status === 'error' && (
        <Button
          variant='plain'
          leftSlot={<WarningTriangleIcon />}
          onClick={() => {
            const onSuccess = () => toast('Comment posted')

            if (isCreateReplyData(state.data)) {
              retryReply.mutate({ optimisticId, ...state.data }, { onSuccess })
            } else {
              retryComment.mutate({ optimisticId, ...state.data }, { onSuccess })
            }
          }}
          accessibilityLabel='Retry'
          tooltip='Retry'
          className='text-red-500'
        >
          Failed to send
        </Button>
      )}
    </div>
  )
}

function InnerCommentHoverActions({
  comment,
  isEditing,
  setIsEditing,
  isInCanvas = false,
  subjectId,
  subjectType,
  canResolvePost,
  canUnresolvePost
}: CommentHoverActionsProps) {
  const canHover = useCanHover()
  const { isFocusVisible } = useFocusVisible()
  const handleReactionSelect = useCommentHandleReactionSelect({
    comment,
    postId: subjectType === 'post' ? subjectId : undefined
  })

  return (
    <div
      className={cn(
        'initial:opacity-0 flex flex-none items-center justify-end rounded-lg p-0.5 transition-opacity',
        'group-hover:opacity-100 [&:has(button[aria-expanded="true"])]:opacity-100 [@media(hover:none)]:opacity-100',
        {
          'focus-within:opacity-100': isFocusVisible,
          'opacity-100': !canHover,
          '-mr-[7px]': isInCanvas,
          '-mr-1': !isInCanvas
        },
        'group-has-[&_[data-state="open"]]:opacity-100'
      )}
    >
      {comment.viewer_can_react && (
        <ReactionPicker
          custom
          align='end'
          trigger={
            <Button
              variant='plain'
              iconOnly={<FaceSmilePlusIcon />}
              accessibilityLabel='Add reaction'
              tooltip='Add reaction'
            />
          }
          onReactionSelect={handleReactionSelect}
        />
      )}

      {comment.viewer_can_resolve && (
        <CommentResolveButton comment={comment} subjectId={subjectId} subjectType={subjectType} />
      )}

      <CommentOverflowDropdown
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        subjectId={subjectId}
        subjectType={subjectType}
        comment={comment}
        canResolvePost={canResolvePost}
        canUnresolvePost={canUnresolvePost}
      />
    </div>
  )
}
