import { NoteIcon } from '@campsite/ui'

import { ViewerUpsellDialog } from '../Upsell/ViewerUpsellDialog'

export function ViewerRoleCreateNoteUpsell({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <ViewerUpsellDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<NoteIcon size={28} />}
      title='Note creation is available to members'
    />
  )
}
