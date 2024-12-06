import { forwardRef } from 'react'
import { useRouter } from 'next/router'

import { LinkProps } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

interface TabProps {
  children: React.ReactNode
  active: boolean
  href?: string | LinkProps['href']
  onClick?: () => void
  replace?: boolean
}

export const SubnavigationTab = forwardRef<HTMLButtonElement, TabProps>((props, ref) => {
  const router = useRouter()

  return (
    <button
      ref={ref}
      onClick={() => {
        if (props.href) {
          if (props.replace) {
            router.replace(props.href)
          } else {
            router.push(props.href)
          }
        }
        if (props.onClick) props.onClick()
      }}
      className={cn(
        'initial:text-tertiary relative flex items-center justify-center gap-1.5 rounded-md bg-transparent py-4 text-sm font-medium after:absolute after:-bottom-px after:h-[2px] after:w-full after:rounded-full after:content-[""]',
        {
          'text-primary after:bg-black dark:after:bg-white': props.active,
          'hover:text-secondary hover:after:bg-neutral-400 hover:dark:after:bg-neutral-600': !props.active
        }
      )}
    >
      {props.children}
    </button>
  )
})

SubnavigationTab.displayName = 'SubnavigationTab'
