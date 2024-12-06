import { m } from 'framer-motion'

import { PlayIcon, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

export function SidebarCollapsibleButton({
  collapsed,
  setCollapsed,
  label
}: {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  label: string
}) {
  return (
    <m.button
      className='hover:bg-quaternary group flex flex-1 items-center rounded-md px-2 py-1 focus:outline-0 focus:ring-0'
      onClick={() => setCollapsed(!collapsed)}
    >
      <span
        className={cn('text-quaternary mr-1.5 transition-transform duration-200', {
          'rotate-0': collapsed,
          'rotate-90': !collapsed
        })}
      >
        <PlayIcon size={12} />
      </span>
      <UIText size='text-xs' tertiary weight='font-medium'>
        {label}
      </UIText>
    </m.button>
  )
}
