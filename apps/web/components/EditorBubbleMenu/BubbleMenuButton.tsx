import { forwardRef, MouseEvent } from 'react'

import { ChevronDownIcon, Tooltip, UIText } from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

type BubbleMenuButtonElement = React.ElementRef<'button'>
interface BubbleMenuProps extends React.ComponentPropsWithRef<'button'> {
  onClick?: (evt: MouseEvent) => void
  isActive?: boolean
  icon: React.ReactNode
  title?: string
  tooltip?: string
  shortcut?: string
  dropdown?: boolean
}

export const BubbleMenuButton = forwardRef<BubbleMenuButtonElement, BubbleMenuProps>(function BubbleMenuButton(
  { icon, isActive = false, onClick, title, tooltip, shortcut, dropdown, ...props }: BubbleMenuProps,
  ref
) {
  return (
    <ConditionalWrap
      condition={!!tooltip}
      wrap={(children) => (
        <Tooltip label={tooltip} shortcut={shortcut} sideOffset={8}>
          {children}
        </Tooltip>
      )}
    >
      <button
        {...props}
        ref={ref}
        type='button'
        onClick={onClick}
        className={cn('hover:bg-quaternary group flex flex-row items-center gap-1 rounded p-1', {
          'bg-blue-500 text-white hover:bg-blue-500': isActive
        })}
      >
        {icon}
        {title && (
          <UIText weight='font-medium' size='text-sm'>
            {title}
          </UIText>
        )}
        {dropdown && (
          <span className='text-tertiary group-hover:text-primary -ml-1'>
            <ChevronDownIcon strokeWidth='2' size={16} />
          </span>
        )}
      </button>
    </ConditionalWrap>
  )
})
