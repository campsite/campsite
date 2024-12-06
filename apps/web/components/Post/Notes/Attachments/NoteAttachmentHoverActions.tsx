import { Button, TrashIcon } from '@campsite/ui'

import { EmbedActionsContainer } from '../EmbedContainer'

interface Props {
  onDelete?: () => void
}

export function NoteAttachmentHoverActions({ onDelete }: Props) {
  return (
    <EmbedActionsContainer>
      {onDelete && (
        <Button
          iconOnly={<TrashIcon size={20} />}
          variant='plain'
          accessibilityLabel='Delete attachment'
          contentEditable={false}
          onClick={onDelete}
          tooltip='Delete attachment'
        />
      )}
    </EmbedActionsContainer>
  )
}
