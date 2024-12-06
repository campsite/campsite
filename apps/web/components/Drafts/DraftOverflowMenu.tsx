import { useState } from 'react'

import { Post } from '@campsite/types/generated'
import { Button, ContextMenu, DotsHorizontal, TrashIcon } from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'

import { DeleteDraftDialog } from '@/components/Drafts/DeleteDraftDialog'

interface DraftOverflowMenuProps extends React.PropsWithChildren {
  type: 'dropdown' | 'context'
  draftPost: Post
}

export function DraftOverflowMenu({ children, type, draftPost }: DraftOverflowMenuProps) {
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)

  const items = buildMenuItems([
    {
      type: 'item',
      leftSlot: <TrashIcon />,
      label: 'Delete',
      destructive: true,
      onSelect: () => setDeleteDialogIsOpen(true)
    }
  ])

  return (
    <>
      <DeleteDraftDialog post={draftPost} open={deleteDialogIsOpen} onOpenChange={setDeleteDialogIsOpen} />

      {type === 'context' ? (
        <ContextMenu asChild items={items}>
          {children}
        </ContextMenu>
      ) : (
        <DropdownMenu
          items={items}
          align='end'
          trigger={<Button variant='plain' iconOnly={<DotsHorizontal />} accessibilityLabel='Draft options' />}
        />
      )}
    </>
  )
}
