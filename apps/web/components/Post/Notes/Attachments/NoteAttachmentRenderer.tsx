import { NodeViewWrapperProps } from '@tiptap/react'

import { InlineAttachmentRenderer } from '@/components/InlineAttachmentRenderer'
import { EmbedContainer } from '@/components/Post/Notes/EmbedContainer'

/**
 * Renders inline note attachments in a TipTap editor.
 */
export function NoteAttachmentRenderer(props: NodeViewWrapperProps) {
  const { id, optimistic_id, error } = props.node.attrs

  const editable = !!props.editor.options.editable

  return (
    <EmbedContainer draggable selected={props.selected} editor={props.editor}>
      <InlineAttachmentRenderer
        id={id}
        optimisticId={optimistic_id}
        error={error}
        editable={editable}
        onOpen={props.extension.options.onOpenAttachment}
        onDelete={editable ? props.deleteNode : undefined}
        commentsEnabled={!props.extension.options.disableComments}
        width={props.node.attrs.width}
        height={props.node.attrs.height}
      />
    </EmbedContainer>
  )
}
