import { useState } from 'react'
import { NodeViewWrapperProps } from '@tiptap/react'

import { PostAttachmentLightbox } from '@/components/AttachmentLightbox/PostAttachmentLightbox'
import { EmbedContainer } from '@/components/Post/Notes/EmbedContainer'

import { InlineAttachmentRenderer } from '../InlineAttachmentRenderer'

/**
 * Renders inline post attachments in a TipTap editor.
 */
export function PostInlineAttachmentRenderer(props: NodeViewWrapperProps) {
  const { id, optimistic_id, error } = props.node.attrs
  const { postId } = props.extension.options
  const editable = !!props.editor.options.editable

  const [selectedPostAttachmentId, setSelectedPostAttachmentId] = useState<string | undefined>()

  return (
    <EmbedContainer draggable selected={props.selected} editor={props.editor}>
      {!editable && (
        <PostAttachmentLightbox
          postId={postId}
          selectedAttachmentId={selectedPostAttachmentId}
          setSelectedAttachmentId={setSelectedPostAttachmentId}
        />
      )}

      <InlineAttachmentRenderer
        id={id}
        optimisticId={optimistic_id}
        error={error}
        editable={editable}
        onOpen={editable ? undefined : setSelectedPostAttachmentId}
        width={props.node.attrs.width}
        height={props.node.attrs.height}
      />
    </EmbedContainer>
  )
}
