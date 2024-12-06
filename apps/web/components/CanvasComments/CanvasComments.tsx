import { memo, useCallback, useMemo } from 'react'
import { useIsomorphicLayoutEffect } from 'framer-motion'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { v4 as uuid } from 'uuid'

import { Attachment, Comment } from '@campsite/types'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'

import { FileMenu } from '@/components/AttachmentLightbox/FileDropdown'
import { usePostAttachmentLightbox } from '@/components/AttachmentLightbox/PostAttachmentLightbox'
import { useGetPost } from '@/hooks/useGetPost'
import { useGetPostCanvasComments } from '@/hooks/useGetPostCanvasComments'
import { notEmpty } from '@/utils/notEmpty'

import { FullPageLoading } from '../FullPageLoading'
import { panZoomAtom } from '../ZoomPane/atom'
import { useCommentCursor } from '../ZoomPane/useCommentCursor'
import { Annotation, ZoomAnnotationsOverlay } from '../ZoomPane/ZoomAnnotationsOverlay'
import { ZoomCanvasTileRenderer } from '../ZoomPane/ZoomCanvasTileRenderer'
import { ZoomImageRenderer } from '../ZoomPane/ZoomImageRenderer'
import { MediaCoordinates, ZoomPane } from '../ZoomPane/ZoomPane'
import { CanvasComment, NewCanvasComment } from './CanvasComment'

export const selectedCanvasCommentIdAtom = atom<string | undefined>(undefined)
export const newCommentCoordinatesAtom = atom<{ x: number; y: number; optimistic_id: string } | undefined>(undefined)
export const displayCanvasCommentsAtom = atom(true)
export const clearNewCommentCoordinatesAtom = atom(null, (_get, set) => set(newCommentCoordinatesAtom, undefined))

const NEW_COMMENT_ANNOTATION_ID = 'new-annotation'

type CommentAnnotation = Annotation & {
  comment: Comment | null
}

interface Props {
  attachment: Attachment
  preventNewComment?: boolean
}

export const CanvasComments = memo(function CanvasComments({ attachment, preventNewComment }: Props) {
  const imageUrl = attachment.optimistic_src ?? attachment.url
  const blurredImageUrl = attachment.optimistic_src ?? attachment.image_urls?.feed_url
  const imageWidth = attachment.width
  const imageHeight = attachment.height
  const tile = attachment.file_type !== 'image/svg+xml'
  const setPan = useSetAtom(panZoomAtom)
  const [newCommentCoordinates, setNewCommentCoordinates] = useAtom(newCommentCoordinatesAtom)
  const [currentCanvasCommentId, setCurrentCanvasCommentId] = useAtom(selectedCanvasCommentIdAtom)
  const postId = usePostAttachmentLightbox()?.postId ?? ''
  const { data: post, isSuccess } = useGetPost({ postId })
  const displayCanvasComments = useAtomValue(displayCanvasCommentsAtom)
  const hideComments = !displayCanvasComments || !isSuccess || preventNewComment
  const cursor = useCommentCursor(!hideComments)

  const getCanvasComments = useGetPostCanvasComments({ postId, enabled: isSuccess })
  const comments = useMemo(() => getCanvasComments.data, [getCanvasComments.data])

  const shouldOpenComment = useCallback(
    (comment: Comment) => {
      return (
        comment.id === currentCanvasCommentId || comment.replies.some((reply) => reply.id === currentCanvasCommentId)
      )
    },
    [currentCanvasCommentId]
  )

  // Callback that gets executed when someone clicks on the comment canvas marker.
  const onAnnotationSelected = (commentId: string) => {
    // if we have a currentCanvasCommentId and it matches the one we click at, then close it
    if (hideComments || (currentCanvasCommentId && currentCanvasCommentId == commentId)) {
      setCurrentCanvasCommentId(undefined)
    } else {
      setCurrentCanvasCommentId(commentId)
      setNewCommentCoordinates(undefined)
    }
  }

  useIsomorphicLayoutEffect(() => {
    if (currentCanvasCommentId) {
      // if we have a current comment selected, let's make sure it's in view
      const comment = comments?.find((comment) => shouldOpenComment(comment))

      if (comment && typeof comment.x === 'number' && typeof comment.y === 'number') {
        setPan({
          x: comment.x,
          y: comment.y
        })
      }
    } else if (newCommentCoordinates) {
      // if we open a new comment, let's make sure it's in view
      setPan({
        x: newCommentCoordinates.x,
        y: newCommentCoordinates.y
      })
    }
  }, [currentCanvasCommentId, shouldOpenComment, newCommentCoordinates])

  const onCanvasSelected = useCallback(
    (mediaCoords: MediaCoordinates | null) => {
      if (currentCanvasCommentId || newCommentCoordinates || hideComments) {
        setCurrentCanvasCommentId(undefined)
        setNewCommentCoordinates(undefined)
      } else if (mediaCoords) {
        const optimisticId = `optimistic_${uuid()}`

        setNewCommentCoordinates({ ...mediaCoords, optimistic_id: optimisticId })
      }
    },
    [currentCanvasCommentId, newCommentCoordinates, hideComments, setCurrentCanvasCommentId, setNewCommentCoordinates]
  )

  const commentAnnotations = useMemo(() => {
    if (hideComments) return []

    const annotations: CommentAnnotation[] =
      comments
        ?.map((comment) => {
          if (
            attachment.id === comment.attachment_id &&
            comment.x &&
            comment.y &&
            // filter out comments where a new one is being added
            // hides the server comment while the new-comment annotation is open
            comment.x !== newCommentCoordinates?.x &&
            comment.y !== newCommentCoordinates?.y
          ) {
            return { x: comment.x, y: comment.y, id: comment.id, comment }
          }
          return null
        })
        .filter(notEmpty) ?? []

    if (newCommentCoordinates) {
      annotations?.push({
        x: newCommentCoordinates.x,
        y: newCommentCoordinates.y,
        id: NEW_COMMENT_ANNOTATION_ID,
        comment: null
      })
    }

    return annotations
  }, [attachment.id, hideComments, comments, newCommentCoordinates])

  if (!imageUrl || !blurredImageUrl) return <FullPageLoading />

  return (
    <>
      <LayeredHotkeys
        keys='Escape'
        callback={(e) => {
          e.stopPropagation()
          e.preventDefault()

          setNewCommentCoordinates(undefined)
          setCurrentCanvasCommentId(undefined)
        }}
        options={{ enabled: !!currentCanvasCommentId || !!newCommentCoordinates }}
      />

      <ZoomPane width={imageWidth} height={imageHeight} onClick={onCanvasSelected}>
        <FileMenu type='menu' attachment={attachment} links={[]}>
          <>
            {tile && (
              <ZoomCanvasTileRenderer
                width={imageWidth}
                height={imageHeight}
                src={imageUrl}
                backgroundSrc={blurredImageUrl}
                style={{ cursor }}
              />
            )}
            {!tile && <ZoomImageRenderer width={imageWidth} height={imageHeight} src={imageUrl} style={{ cursor }} />}
          </>
        </FileMenu>

        <ZoomAnnotationsOverlay
          annotations={commentAnnotations}
          getNode={(annotation) => {
            if (!isSuccess) return null

            const sharedProps = {
              attachmentId: attachment.id,
              onSelected: onAnnotationSelected,
              onDismiss: () => onCanvasSelected(null),
              // leave the new-comment open even if we have fetched a server comment
              isOpen: !annotation.comment || shouldOpenComment(annotation.comment),
              post,
              coordinates: { x: annotation.x, y: annotation.y }
            }

            if (annotation.comment) {
              return <CanvasComment comment={annotation.comment} {...sharedProps} />
            }

            return <NewCanvasComment {...sharedProps} />
          }}
        />
      </ZoomPane>
    </>
  )
})
