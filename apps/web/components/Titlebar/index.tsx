import { nativeWindow } from '@todesktop/client-core'

import { Button, ReorderHandlesIcon } from '@campsite/ui'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { BackButton } from '@/components/BackButton'
import { ProfileDropdown } from '@/components/NavigationSidebar/ProfileDropdown'

interface Props {
  className?: string
  leadingSlot?: React.ReactNode
  trailingSlot?: React.ReactNode
  centerSlot?: React.ReactNode
  disableBottomBorder?: boolean
}

export function BasicTitlebar({
  className = '',
  leadingSlot = <BackButton />,
  trailingSlot = (
    <ProfileDropdown
      align='end'
      side='bottom'
      trigger={<Button variant='plain' iconOnly={<ReorderHandlesIcon size={24} />} accessibilityLabel='Menu' />}
    />
  ),
  centerSlot = <></>,
  disableBottomBorder
}: Props) {
  const isDesktop = useIsDesktopApp()

  return (
    <header
      onDoubleClick={() => isDesktop && nativeWindow.maximize()}
      className={cn(
        'drag bg-primary grid h-[--navbar-height] flex-none grid-cols-5 items-center px-4 lg:grid-cols-3',
        { 'border-b': !disableBottomBorder },
        className
      )}
    >
      <div
        className={cn('flex items-center justify-start', {
          'pl-18': isDesktop
        })}
      >
        {leadingSlot}
      </div>
      <div className='col-span-3 flex items-center justify-center lg:col-span-1'>{centerSlot}</div>
      <div className='flex items-center justify-end'>{trailingSlot}</div>
    </header>
  )
}
