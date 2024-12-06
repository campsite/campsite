import { useState } from 'react'
import { useRouter } from 'next/router'

import { Post } from '@campsite/types/generated'
import {
  Badge,
  Button,
  CheckCircleFilledIcon,
  ChevronDownIcon,
  cn,
  InformationIcon,
  RotateIcon,
  UIText
} from '@campsite/ui'

import { EMPTY_HTML } from '@/atoms/markdown'
import { enumerateCommentElements } from '@/components/Comments/CommentsList'
import { ConfirmDeleteResolutionDialog } from '@/components/InlinePost/ConfirmDeleteResolutionDialog'
import { useUnresolvePost } from '@/hooks/useUnresolvePost'

import { HTMLRenderer } from '../HTMLRenderer'

interface Props {
  post: Post
  display: 'hovercard' | 'page' | 'feed'
  className?: string
}

const isEmptyHtml = (html: string | null | undefined) => !html || html === EMPTY_HTML

export function Resolution({ post, display, className }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(true)
  const { mutate: unresolvePost } = useUnresolvePost()
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)

  if (!post.resolution) return null

  const html = !isEmptyHtml(post.resolution.resolved_html) ? post.resolution.resolved_html : null
  const comment = post.resolution.resolved_comment
  const commentResolvedBySomeoneElse = comment && post.resolution.resolved_by.id !== comment.member.id
  const shouldConfirm = !!html || !!comment
  const previewHtml = html ? html : comment ? `<p>${comment.member.user.display_name}'s comment</p>` : null

  function onCommentClick() {
    if (!comment) return

    if (display === 'feed') {
      router.push(comment.url)
    } else if (display === 'page') {
      enumerateCommentElements(comment.id, (el) => el.scrollIntoView({ block: 'center', behavior: 'smooth' }))
    }
  }

  function handleDelete() {
    if (shouldConfirm) {
      setConfirmationDialogOpen(true)
    } else {
      unresolvePost({ postId: post.id })
    }
  }

  return (
    <div
      className={cn(
        'group flex w-full flex-col overflow-hidden rounded-lg border shadow-sm',
        {
          'bg-elevated': display === 'page' || display === 'hovercard',
          'bg-secondary dark:bg-elevated -mb-1 mt-4': display === 'feed'
        },
        className
      )}
    >
      <div className='relative flex h-11 items-center gap-3 p-3 pr-2 text-left'>
        <button
          onClick={() => {
            if (display === 'hovercard') return

            if (html) {
              setExpanded(!expanded)
            }
          }}
          className='absolute inset-0 z-0'
        />
        <Badge icon={<CheckCircleFilledIcon />} color='green' className='py-0.5'>
          Resolved by {post.resolution.resolved_by.user.display_name}
        </Badge>
        <span className='pointer-events-none flex flex-1 items-center gap-1.5'>
          {!expanded && previewHtml && (
            <>
              <HTMLRenderer
                text={previewHtml}
                className='line-clamp-1 flex-1 select-none text-sm opacity-40 max-lg:hidden'
              />
            </>
          )}
        </span>
        <span className='flex gap-0.5'>
          {post.viewer_can_resolve && (
            <>
              <ConfirmDeleteResolutionDialog
                postId={post.id}
                open={confirmationDialogOpen}
                onOpenChange={setConfirmationDialogOpen}
              />
              <Button
                variant='plain'
                className='text-quaternary hover:text-primary opacity-0 group-hover:opacity-100 max-lg:opacity-100'
                iconOnly={<RotateIcon />}
                onClick={handleDelete}
                accessibilityLabel='Reopen post'
                tooltip='Reopen post'
                tooltipShortcut={display === 'page' ? 'shift+r' : undefined}
              />
            </>
          )}
          {html && display !== 'hovercard' && (
            <Button
              variant='plain'
              className='text-quaternary hover:text-primary hidden opacity-0 group-hover:opacity-100 lg:flex'
              iconOnly={
                <ChevronDownIcon
                  className={cn('-rotate-180 transform transition-all duration-300', {
                    'rotate-0': expanded
                  })}
                />
              }
              onClick={() => setExpanded(!expanded)}
              accessibilityLabel={expanded ? 'Collapse' : 'Expand'}
            />
          )}
        </span>
      </div>
      {expanded && html && (
        <>
          <div className='flex flex-col gap-3 px-3 pb-3'>
            <HTMLRenderer text={html} className='prose w-full max-w-full select-text focus:outline-none' />
            {comment && display !== 'hovercard' && (
              <div>
                <Button variant='flat' onClick={onCommentClick} className='text-sm font-medium'>
                  View comment
                </Button>
              </div>
            )}
          </div>
          {commentResolvedBySomeoneElse && (
            <>
              <div className='h-0 w-full flex-none border-b' />
              <UIText tertiary size='text-xs' className='bg-secondary px-3 py-2 text-center'>
                Resolved by {post.resolution.resolved_by.user.display_name}
              </UIText>
            </>
          )}
        </>
      )}
    </div>
  )
}

export function CommentComposerResolutionBanner() {
  return (
    <span className='text-secondary relative left-px flex w-[calc(100%-2px)] items-center justify-center gap-1 rounded-t-lg bg-green-500 px-2 pb-3.5 pt-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-white dark:bg-green-900/50 dark:text-green-400'>
      <span>Post resolved</span>
      <InformationIcon className='opacity-80' size={14} />
    </span>
  )
}
