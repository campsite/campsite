import { PropsWithChildren } from 'react'
import * as HoverCard from '@radix-ui/react-hover-card'

import { Post } from '@campsite/types/generated'
import { cn, CONTAINER_STYLES } from '@campsite/ui'

import { Resolution } from '@/components/InlinePost/Resolution'

type Props = PropsWithChildren & {
  post: Post
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

export function ResolutionHovercard({ post, children, side = 'bottom', align = 'start', sideOffset = 4 }: Props) {
  return (
    <HoverCard.Root openDelay={200}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          hideWhenDetached
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={8}
          className={cn(
            'shadow-popover w-[420px] overflow-hidden rounded-lg max-md:hidden',
            CONTAINER_STYLES.animation
          )}
        >
          <Resolution post={post} display='hovercard' />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
