import { Editor } from '@tiptap/core'
import { NodeViewWrapperProps } from '@tiptap/react'

import { MediaGalleryItemAttributes } from '@campsite/editor/extensions'
import { Button } from '@campsite/ui/Button'
import { TrashIcon } from '@campsite/ui/Icons'

import { MediaGallery } from '@/components/MediaGallery'
import { useUploadNoteAttachments } from '@/components/Post/Notes/Attachments/useUploadAttachments'
import { EmbedActionsContainer, EmbedContainer } from '@/components/Post/Notes/EmbedContainer'
import { useUploadHelpers } from '@/hooks/useUploadHelpers'

function useUploadGalleryAttachments({ galleryId, editor }: { galleryId: string; editor: Editor }) {
  const upload = useUploadNoteAttachments({ enabled: true })

  return useUploadHelpers({
    enabled: true,
    upload: (files: File[]) => {
      return upload({ files, galleryId, editor })
    }
  })
}

export function MediaGalleryRenderer(props: NodeViewWrapperProps) {
  const attachments = (props.node.content?.content?.map((c: any) => c.attrs) ?? []) as MediaGalleryItemAttributes[]

  const editable = !!props.editor.options.editable
  const galleryId = props.node.attrs.id

  const { dropzone } = useUploadGalleryAttachments({
    galleryId,
    editor: props.editor
  })

  function updateOrder(ids: string[]) {
    props.editor.commands.updateGalleryOrder(galleryId, ids)
  }

  return (
    <EmbedContainer draggable selected={props.selected} editor={props.editor} className='my-4'>
      <div className='relative' {...dropzone.getRootProps()}>
        <MediaGallery
          attachments={attachments}
          onRemoveItem={editable ? props.editor.commands.removeGalleryItem : undefined}
          onReorder={editable ? updateOrder : undefined}
          dropzone={editable ? dropzone : undefined}
          onOpenAttachment={props.extension.options.onOpenAttachment}
          editable={editable}
          galleryId={galleryId}
        />

        {editable && (
          <>
            <input {...dropzone.getInputProps()} />
            <EmbedActionsContainer>
              <Button
                iconOnly={<TrashIcon size={20} />}
                variant='plain'
                accessibilityLabel='Delete gallery'
                contentEditable={false}
                onClick={props.deleteNode}
                tooltip='Delete gallery'
              />
            </EmbedActionsContainer>
          </>
        )}
      </div>
    </EmbedContainer>
  )
}
