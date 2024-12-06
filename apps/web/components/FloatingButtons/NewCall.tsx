import { isMobile } from 'react-device-detect'

import { Button, cn } from '@campsite/ui'

import { NewCallDropdownMenu } from '@/components/Calls/NewCallDropdownMenu'

export function FloatingNewCallButton() {
  return (
    <div
      className={cn('fixed bottom-16 right-4 z-20 lg:hidden', {
        'mb-safe-offset-2': isMobile
      })}
    >
      <NewCallDropdownMenu
        align='end'
        trigger={
          <Button
            className='dark:bg-elevated bg-black text-white shadow-md hover:bg-gray-800 dark:shadow-[inset_0px_1px_0px_rgb(255_255_255_/_0.04),_inset_0px_0px_0px_1px_rgb(255_255_255_/_0.02),_0px_1px_2px_rgb(0_0_0_/_0.4),_0px_2px_4px_rgb(0_0_0_/_0.08),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24)] dark:hover:bg-gray-800'
            variant='plain'
            round
            size='large'
          >
            New call
          </Button>
        }
      />
    </div>
  )
}
