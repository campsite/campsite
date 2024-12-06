import { PropsWithChildren } from 'react'

import { cn, Popover, PopoverAnchor, PopoverContent, PopoverPortal } from '@campsite/ui'

import { TLDR } from '@/components/Post/TLDR'

interface PostTldrPopoverProps extends PropsWithChildren {
  postId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostTldrPopover({ postId, open, onOpenChange, children }: PostTldrPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverPortal>
        <PopoverContent
          side='top'
          align='center'
          sideOffset={8}
          className={cn(
            'w-[440px]',
            'shadow-popover bg-elevated flex w-[420px] flex-col gap-1 overflow-hidden rounded-lg max-md:hidden',
            'dark:shadow-[inset_0px_1px_0px_rgb(255_255_255_/_0.04),_inset_0px_0px_0px_1px_rgb(255_255_255_/_0.02),_0px_1px_2px_rgb(0_0_0_/_0.4),_0px_2px_4px_rgb(0_0_0_/_0.08),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24)]'
          )}
        >
          <TLDR open={open} postId={postId} source='popover' />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
