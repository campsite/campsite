import { MediaGalleryItemAttributes, MediaGalleryOptions } from '@campsite/editor'

import { MediaGallery as MediaGalleryComponent } from '@/components/MediaGallery'

import { NodeHandler } from '.'

export const MediaGallery: NodeHandler<MediaGalleryOptions> = ({ node, onOpenAttachment }) => {
  const attachments = (node.content?.map((c: any) => c.attrs) ?? []) as MediaGalleryItemAttributes[]
  const galleryId = node.attrs?.id

  return <MediaGalleryComponent attachments={attachments} onOpenAttachment={onOpenAttachment} galleryId={galleryId} />
}
