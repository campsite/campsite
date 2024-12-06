import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

import { Post } from '@campsite/types'
import {
  AlarmCheckIcon,
  AlarmIcon,
  BellCheckIcon,
  BellIcon,
  Button,
  ContextMenu,
  CopyIcon,
  DotsHorizontal,
  LinearIcon,
  LinkIcon,
  LoadingSpinner,
  PaperAirplaneIcon,
  PencilIcon,
  PinTackFilledIcon,
  PinTackIcon,
  ProjectIcon,
  RefreshIcon,
  ResolvePostIcon,
  RotateIcon,
  SmartSummaryIcon,
  StarFilledIcon,
  StarOutlineIcon,
  TrashIcon
} from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'
import { useCopyToClipboard } from '@campsite/ui/src/hooks'

import { ConfirmDeleteResolutionDialog } from '@/components/InlinePost/ConfirmDeleteResolutionDialog'
import { LinearPostIssueComposerDialog } from '@/components/LinearIssueComposerDialog'
import { DeletePostDialog } from '@/components/Post/DeletePostDialog'
import { PostFollowUpDialog } from '@/components/Post/PostFollowUpDialog'
import { PostMoveProjectDialog } from '@/components/Post/PostMoveProjectDialog'
import { PostShareDialog } from '@/components/Post/PostShareDialog'
import { PostComposerType, usePostComposer } from '@/components/PostComposer'
import { useCreatePostFavorite } from '@/hooks/useCreatePostFavorite'
import { useCreatePostPin } from '@/hooks/useCreatePostPin'
import { useCreatePostSubscription } from '@/hooks/useCreatePostSubscription'
import { useDeletePostFavorite } from '@/hooks/useDeletePostFavorite'
import { useDeletePostPin } from '@/hooks/useDeletePostPin'
import { useDeletePostSubscription } from '@/hooks/useDeletePostSubscription'
import { useGetLinearIntegration } from '@/hooks/useGetLinearIntegration'
import { useGetPost } from '@/hooks/useGetPost'
import { useGetPostVersions } from '@/hooks/useGetPostVersions'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

import { ResolveDialog } from './ResolveDialog'

interface PostOverflowMenuProps extends React.PropsWithChildren {
  type: 'dropdown' | 'context'
  post: Post
  onTldrOpen?: () => void
  align?: 'start' | 'end' | 'center'
}

export function PostOverflowMenu({ post, type, children, onTldrOpen, align = 'start' }: PostOverflowMenuProps) {
  const { showPostComposer } = usePostComposer()
  const deletePostSubscription = useDeletePostSubscription()
  const createPostSubscription = useCreatePostSubscription()
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)
  const [projectDialogIsOpen, setProjectDialogIsOpen] = useState(false)
  const [shareDialogIsOpen, setShareDialogIsOpen] = useState(false)
  const [resolveDialogIsOpen, setResolveDialogIsOpen] = useState(false)
  const [confirmDeleteResolutionDialogIsOpen, setConfirmDeleteResolutionDialogIsOpen] = useState(false)
  const [linearIssueDialogIsOpen, setLinearIssueDialogIsOpen] = useState(false)
  const [copy] = useCopyToClipboard()
  const viewerIsAdmin = useViewerIsAdmin({ enabled: post.viewer_is_organization_member })
  const isSubscribed = post.viewer_has_subscribed
  const isPostView = useRouter().query.postId === post.id
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const { mutate: createFavorite } = useCreatePostFavorite()
  const { mutate: deleteFavorite } = useDeletePostFavorite()
  const { data: hasLinearIntegration } = useGetLinearIntegration()
  const createPin = useCreatePostPin()
  const removePin = useDeletePostPin()
  const [followUpIsOpen, setFollowUpIsOpen] = useState(false)

  const shouldPrefetchVersions = dropdownIsOpen && post?.viewer_is_author && !!post?.id
  const getVersions = useGetPostVersions(post?.id ?? '', {
    enabled: shouldPrefetchVersions
  })
  const isLoadingVersions = getVersions.isLoading || getVersions.isFetching
  const latestVersionId = getVersions.data?.[getVersions.data.length - 1]?.id
  const { data: latestPost } = useGetPost({ postId: latestVersionId })

  const showNewVersionAction = post && post.viewer_is_author
  const hasViewerFollowUp = post.follow_ups.some((f) => f.belongs_to_viewer)

  const items = buildMenuItems([
    post.viewer_can_favorite && {
      type: 'item',
      leftSlot: post.viewer_has_favorited ? <StarFilledIcon className='text-yellow-400' /> : <StarOutlineIcon />,
      label: post.viewer_has_favorited ? 'Favorited' : 'Favorite',
      onSelect: () => {
        if (post.viewer_has_favorited) {
          deleteFavorite(post.id, {
            onSuccess: () => toast('Unfavorited post')
          })
        } else {
          createFavorite(post, {
            onSuccess: () => toast('Favorited post')
          })
        }
      }
    },

    {
      type: 'item',
      leftSlot: hasViewerFollowUp ? <AlarmCheckIcon /> : <AlarmIcon />,
      label: hasViewerFollowUp ? 'Change follow up...' : 'Follow up...',
      kbd: isPostView ? 'f' : undefined,
      onSelect: () => setFollowUpIsOpen(true)
    },

    post.viewer_is_organization_member && {
      type: 'item',
      leftSlot: isSubscribed ? <BellCheckIcon /> : <BellIcon />,
      label: isSubscribed ? 'Subscribed to activity' : 'Subscribe',
      onSelect: () => {
        if (isSubscribed) {
          deletePostSubscription.mutate(post.id, {
            onSuccess: () => toast('Unsubscribed from post')
          })
        } else {
          createPostSubscription.mutate(post.id, {
            onSuccess: () => toast('Subscribed to post')
          })
        }
      }
    },

    onTldrOpen && {
      type: 'item',
      leftSlot: <SmartSummaryIcon />,
      label: 'Summary',
      onSelect: onTldrOpen
    },

    hasLinearIntegration && post.viewer_can_create_issue && { type: 'separator' },

    hasLinearIntegration &&
      post.viewer_can_create_issue && {
        type: 'item',
        leftSlot: <LinearIcon />,
        label: 'Create Linear issue',
        onSelect: () => {
          setTimeout(() => {
            // delay the dialog so autofocus isn't suppressed
            setLinearIssueDialogIsOpen(true)
          }, 200)
        }
      },

    (showNewVersionAction || post.viewer_is_author || viewerIsAdmin || post.viewer_can_resolve) && {
      type: 'separator'
    },

    (post.viewer_is_author || viewerIsAdmin) && {
      type: 'item',
      leftSlot: <ProjectIcon />,
      label: 'Move to channel...',
      onSelect: () => setProjectDialogIsOpen(true)
    },

    {
      type: 'item',
      leftSlot: post.project_pin_id ? <PinTackFilledIcon className='text-brand-primary' /> : <PinTackIcon />,
      label: post.project_pin_id ? 'Pinned in channel' : 'Pin to channel',
      onSelect: () => {
        if (post.project_pin_id) {
          removePin.mutate(
            { projectId: post.project.id, pinId: post.project_pin_id, postId: post.id },
            { onSuccess: () => toast('Unpinned post') }
          )
        } else {
          createPin.mutate({ projectId: post.project.id, postId: post.id }, { onSuccess: () => toast('Pinned post') })
        }
      }
    },

    post.viewer_can_resolve &&
      !post.resolution && {
        type: 'item',
        leftSlot: <ResolvePostIcon />,
        label: 'Resolve post',
        kbd: isPostView ? 'shift+r' : undefined,
        onSelect: () => setResolveDialogIsOpen(true)
      },

    post.viewer_can_resolve &&
      post.resolution && {
        type: 'item',
        leftSlot: <RotateIcon />,
        label: 'Reopen post',
        kbd: isPostView ? 'shift+r' : undefined,
        onSelect: () => setConfirmDeleteResolutionDialogIsOpen(true)
      },

    showNewVersionAction && {
      type: 'item',
      leftSlot: isLoadingVersions ? (
        <div className='flex h-5 w-5 items-center justify-center'>
          <LoadingSpinner />
        </div>
      ) : (
        <RefreshIcon />
      ),
      label: 'New version',
      disabled: !latestPost,
      onSelect: () => {
        if (!latestPost) return
        showPostComposer({ type: PostComposerType.DraftFromPost, post: latestPost })
      }
    },

    post.viewer_is_organization_member && { type: 'separator' },

    post.viewer_is_organization_member && {
      type: 'item',
      leftSlot: <PaperAirplaneIcon />,
      label: 'Share',
      onSelect: () => setShareDialogIsOpen(true)
    },
    {
      type: 'item',
      leftSlot: <LinkIcon />,
      label: 'Copy link',
      kbd: isPostView ? 'mod+shift+c' : undefined,
      onSelect: () => {
        copy(post.url)
        toast('Copied to clipboard')
      }
    },
    {
      type: 'item',
      leftSlot: <CopyIcon />,
      label: 'Copy ID',
      onSelect: () => {
        copy(post.id)
        toast('Copied to clipboard')
      }
    },

    (post.viewer_can_edit || post.viewer_can_delete) && { type: 'separator' },

    post.viewer_can_edit && {
      type: 'item',
      leftSlot: <PencilIcon />,
      label: 'Edit',
      onSelect: () => showPostComposer({ type: PostComposerType.EditPost, post })
    },
    post.viewer_can_delete && {
      type: 'item',
      leftSlot: <TrashIcon isAnimated />,
      label: 'Delete',
      destructive: true,
      onSelect: () => setDeleteDialogIsOpen(true)
    }
  ])

  if (!post?.viewer_is_organization_member) return null

  return (
    <>
      <PostFollowUpDialog post={post} open={followUpIsOpen} onOpenChange={setFollowUpIsOpen} />
      <ResolveDialog postId={post.id} open={resolveDialogIsOpen} onOpenChange={setResolveDialogIsOpen} />
      <ConfirmDeleteResolutionDialog
        postId={post.id}
        open={confirmDeleteResolutionDialogIsOpen}
        onOpenChange={setConfirmDeleteResolutionDialogIsOpen}
      />
      <DeletePostDialog post={post} open={deleteDialogIsOpen} onOpenChange={setDeleteDialogIsOpen} />
      <PostMoveProjectDialog post={post} open={projectDialogIsOpen} onOpenChange={setProjectDialogIsOpen} />
      <LinearPostIssueComposerDialog
        key={linearIssueDialogIsOpen ? 'open' : 'closed'}
        open={linearIssueDialogIsOpen}
        onOpenChange={setLinearIssueDialogIsOpen}
        postId={post.id}
        defaultValues={{ title: post.title }}
      />
      <PostShareDialog post={post} isOpen={shareDialogIsOpen} setIsOpen={setShareDialogIsOpen} />

      {type === 'context' ? (
        <ContextMenu asChild items={items} onOpenChange={setDropdownIsOpen}>
          {children}
        </ContextMenu>
      ) : (
        <DropdownMenu
          open={dropdownIsOpen}
          onOpenChange={setDropdownIsOpen}
          items={items}
          align={align}
          trigger={
            children ?? (
              <Button variant='plain' iconOnly={<DotsHorizontal />} accessibilityLabel='Post actions dropdown' />
            )
          }
        />
      )}
    </>
  )
}
