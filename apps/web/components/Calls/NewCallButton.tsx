import { Button } from '@campsite/ui/Button'
import { DropdownMenuProps } from '@campsite/ui/DropdownMenu'
import { ChevronDownIcon } from '@campsite/ui/Icons'

import { NewCallDropdownMenu } from '@/components/Calls/NewCallDropdownMenu'

interface Props {
  alignMenu?: DropdownMenuProps['align']
}

export function NewCallButton({ alignMenu = 'end' }: Props) {
  return (
    <NewCallDropdownMenu
      align={alignMenu}
      trigger={
        <Button variant='primary' rightSlot={<ChevronDownIcon />}>
          New call
        </Button>
      }
    />
  )
}
