import { useState } from 'react'
import toast from 'react-hot-toast'

import { Comment } from '@campsite/types'
import {
  Button,
  CopyIcon,
  DotsHorizontal,
  LinearIcon,
  LinkIcon,
  PencilIcon,
  PostPlusIcon,
  ResolveCommentIcon,
  ResolvePostIcon,
  RotateIcon,
  TrashIcon,
  UnresolveCommentIcon
} from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'
import { useCopyToClipboard } from '@campsite/ui/src/hooks'

import { FollowUpCalendarDialog } from '@/components/FollowUp'
import { ConfirmDeleteResolutionDialog } from '@/components/InlinePost/ConfirmDeleteResolutionDialog'
import { LinearCommentIssueComposerDialog } from '@/components/LinearIssueComposerDialog'
import { ResolveDialog } from '@/components/Post/ResolveDialog'
import { usePostComposer } from '@/components/PostComposer/hooks/usePostComposer'
import { PostComposerType } from '@/components/PostComposer/utils'
import { useFollowUpMenuBuilder } from '@/hooks/useFollowUpMenuBuilder'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetLinearIntegration } from '@/hooks/useGetLinearIntegration'
import { useGetNote } from '@/hooks/useGetNote'
import { useGetPost } from '@/hooks/useGetPost'
import { useResolveComment } from '@/hooks/useResolveComment'
import { useUnresolveComment } from '@/hooks/useUnresolveComment'

import { CommentDeleteDialog } from './CommentDeleteDialog'

interface CommentOverflowDropdownProps {
  comment: Comment
  subjectId: string
  subjectType: 'post' | 'note'
  isOrganizationMember?: boolean
  isEditing: boolean
  canResolvePost?: boolean
  canUnresolvePost?: boolean
  setIsEditing: (isEditing: boolean) => void
  handleOpenChange?: (open: boolean) => void
}

export function CommentOverflowDropdown({
  comment,
  subjectId,
  subjectType,
  setIsEditing,
  isEditing,
  canResolvePost = false,
  canUnresolvePost = false,
  handleOpenChange
}: CommentOverflowDropdownProps) {
  const [copy] = useCopyToClipboard()
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [resolveDialogIsOpen, setResolveDialogIsOpen] = useState(false)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [linearIssueDialogIsOpen, setLinearIssueDialogIsOpen] = useState(false)
  const resolve = useResolveComment()
  const unresolve = useUnresolveComment()
  const { data: hasLinearIntegration } = useGetLinearIntegration()
  const { followUpMenuItem, calendarOpen, setCalendarOpen, createFollowUp } = useFollowUpMenuBuilder(comment)
  const canPost = !!useGetCurrentOrganization().data?.viewer_can_post
  const { showPostComposer } = usePostComposer()
  const canCreateIssue = hasLinearIntegration && comment.viewer_can_create_issue && subjectType === 'post'

  const { data: post } = useGetPost({ postId: subjectType === 'post' ? subjectId : undefined })
  const { data: note } = useGetNote({ id: subjectType === 'note' ? subjectId : undefined })

  const items = buildMenuItems([
    followUpMenuItem,

    ...buildMenuItems(
      (canPost || canCreateIssue) && [
        { type: 'separator' },
        canPost && {
          type: 'item',
          leftSlot: <PostPlusIcon />,
          label: 'Start a post...',
          onSelect: () => {
            showPostComposer({
              type: PostComposerType.DraftFromComment,
              comment,
              projectId: post?.project?.id || note?.project?.id
            })
          }
        },
        canCreateIssue && {
          type: 'item',
          leftSlot: <LinearIcon />,
          label: 'Create Linear issue',
          onSelect: () => {
            setTimeout(() => {
              // delay the dialog so autofocus isn't suppressed
              setLinearIssueDialogIsOpen(true)
            }, 200)
          }
        }
      ]
    ),

    (comment.viewer_can_resolve || canResolvePost || canUnresolvePost) && { type: 'separator' },
    comment.viewer_can_resolve &&
      !comment.resolved_at && {
        type: 'item',
        label: 'Resolve comment',
        leftSlot: <ResolveCommentIcon />,
        onSelect: () => resolve.mutate({ commentId: comment.id, subjectId, subjectType })
      },
    comment.viewer_can_resolve &&
      comment.resolved_at && {
        type: 'item',
        label: 'Reopen comment',
        leftSlot: <UnresolveCommentIcon />,
        onSelect: () => unresolve.mutate({ commentId: comment.id, subjectId, subjectType })
      },
    canResolvePost && {
      type: 'item',
      leftSlot: <ResolvePostIcon />,
      label: 'Resolve post',
      onSelect: () => setResolveDialogIsOpen(true)
    },
    canUnresolvePost && {
      type: 'item',
      leftSlot: <RotateIcon />,
      label: 'Reopen post',
      onSelect: () => setConfirmationDialogOpen(true)
    },

    { type: 'separator' },
    {
      type: 'item',
      label: 'Copy link',
      leftSlot: <LinkIcon />,
      onSelect: () => {
        copy(comment.url)
        toast('Copied to clipboard')
      }
    },
    {
      type: 'item',
      leftSlot: <CopyIcon />,
      label: 'Copy ID',
      onSelect: () => {
        copy(comment.id)
        toast('Copied to clipboard')
      }
    },

    (comment.viewer_can_edit || comment.viewer_can_delete) && { type: 'separator' },
    comment.viewer_can_edit && {
      type: 'item',
      label: 'Edit',
      leftSlot: <PencilIcon />,
      onSelect: () => setIsEditing(!isEditing)
    },
    comment.viewer_can_delete && {
      type: 'item',
      label: 'Delete',
      leftSlot: <TrashIcon isAnimated />,
      destructive: true,
      onSelect: () => setDialogIsOpen(true)
    }
  ])

  return (
    <>
      <FollowUpCalendarDialog open={calendarOpen} onOpenChange={setCalendarOpen} onCreate={createFollowUp} />
      <CommentDeleteDialog subjectId={subjectId} open={dialogIsOpen} onOpenChange={setDialogIsOpen} comment={comment} />
      <ResolveDialog
        postId={subjectId}
        comment={comment}
        open={resolveDialogIsOpen}
        onOpenChange={setResolveDialogIsOpen}
      />
      <ConfirmDeleteResolutionDialog
        postId={subjectId}
        open={confirmationDialogOpen}
        onOpenChange={setConfirmationDialogOpen}
      />
      <LinearCommentIssueComposerDialog
        key={linearIssueDialogIsOpen ? 'open' : 'closed'}
        open={linearIssueDialogIsOpen}
        onOpenChange={setLinearIssueDialogIsOpen}
        commentId={comment.parent_id || comment.id}
        defaultValues={{
          title: subjectType === 'post' ? post?.title : note?.title
        }}
      />

      <DropdownMenu
        items={items}
        align='end'
        trigger={<Button variant='plain' iconOnly={<DotsHorizontal />} accessibilityLabel='Comment actions dropdown' />}
        disabled={comment.is_optimistic}
        onOpenChange={handleOpenChange}
      />
    </>
  )
}
