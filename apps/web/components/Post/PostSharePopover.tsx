import React from 'react'

import { Post } from '@campsite/types'
import { CONTAINER_STYLES, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { PostShareControls } from '@/components/Post/PostShareControls'

interface PostSharePopoverProps extends React.PropsWithChildren {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  source: string
}

export function PostSharePopover({
  post,
  children,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'end',
  source
}: PostSharePopoverProps) {
  if (!post.viewer_is_organization_member) return null

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          avoidCollisions
          side={side}
          align={align}
          sideOffset={8}
          onKeyDownCapture={(evt) => {
            // Temporary fix: prevent close when focused on react-select input
            if (evt.key === 'Escape' && document.activeElement instanceof HTMLInputElement) {
              evt.preventDefault()
            }
          }}
          onBlurCapture={(evt) => evt.preventDefault()}
          className={cn(
            'w-[440px]',
            CONTAINER_STYLES.base,
            CONTAINER_STYLES.shadows,
            'bg-elevated rounded-xl dark:border dark:bg-clip-border'
          )}
        >
          <PostShareControls post={post} isOpen={open} source={source} />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
