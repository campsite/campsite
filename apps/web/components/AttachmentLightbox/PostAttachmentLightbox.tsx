import { createContext, useContext, useMemo } from 'react'
import { useSetAtom } from 'jotai'

import { selectedCanvasCommentIdAtom } from '@/components/CanvasComments/CanvasComments'
import { useGetPost } from '@/hooks/useGetPost'

import { AttachmentLightbox, filterLightboxableAttachments } from '.'

interface PostAttachmentLightboxContextType {
  postId: string
}

const PostAttachmentLightboxContext = createContext<PostAttachmentLightboxContextType | null>(null)

export const usePostAttachmentLightbox = () => useContext(PostAttachmentLightboxContext)

interface Props {
  postId: string
  galleryId?: string
  selectedAttachmentId: string | undefined
  setSelectedAttachmentId: (id: string | undefined) => void
}

export function PostAttachmentLightbox({ postId, galleryId, selectedAttachmentId, setSelectedAttachmentId }: Props) {
  const setSelectedCanvasCommentId = useSetAtom(selectedCanvasCommentIdAtom)
  // only fetch when the lightbox is open
  const { data: post } = useGetPost({ postId, fetchIfStale: true, enabled: !!selectedAttachmentId })
  const attachments = useMemo(
    () => filterLightboxableAttachments(post?.attachments ?? [], galleryId),
    [post?.attachments, galleryId]
  )
  const value = useMemo(() => ({ postId }), [postId])

  if (!post) return null

  return (
    <PostAttachmentLightboxContext.Provider value={value}>
      <AttachmentLightbox
        subject={post}
        selectedAttachmentId={selectedAttachmentId}
        attachments={attachments}
        onClose={() => {
          setSelectedCanvasCommentId(undefined)
          setSelectedAttachmentId(undefined)
        }}
        onSelectAttachment={(attachment) => setSelectedAttachmentId(attachment.id)}
      />
    </PostAttachmentLightboxContext.Provider>
  )
}
