import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { DropzoneState } from 'react-dropzone'

import { IMGIX_DOMAIN } from '@campsite/config'
import { MediaGalleryItemAttributes } from '@campsite/editor/extensions'
import { ImageUrls } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

import { CarouselPagination } from '@/components/MediaGallery/Pagination'
import { GifAttachment } from '@/components/Thread/Bubble/AttachmentCard/GifAttachment'
import { ImageAttachment } from '@/components/Thread/Bubble/AttachmentCard/ImageAttachment'
import { LottieAttachment } from '@/components/Thread/Bubble/AttachmentCard/LottieAttachment'
import { OrigamiAttachment } from '@/components/Thread/Bubble/AttachmentCard/OrigamiAttachment'
import { PrincipleAttachment } from '@/components/Thread/Bubble/AttachmentCard/PrincipleAttachment'
import { StitchAttachment } from '@/components/Thread/Bubble/AttachmentCard/StitchAttachment'
import { VideoAttachment } from '@/components/Thread/Bubble/AttachmentCard/VideoAttachment'
import { useServerOrOptimisticAttachment } from '@/hooks/useServerOrOptimisticAttachment'

function prefetchPostImages(imageUrls: ImageUrls) {
  const urls = [imageUrls.thumbnail_url, imageUrls.feed_url, imageUrls.slack_url]

  urls.forEach((url) => {
    const img = new Image()

    img.src = url
  })
}

function prefetchPostVideo(path: string) {
  const src = `${IMGIX_DOMAIN}/${path}`
  const video = document.createElement('video')

  video.src = src + '#t=0.1'
  video.load()
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? '100%' : '-100%',
      scale: 0.5,
      filter: 'blur(8px)',
      opacity: 0
    }
  },
  center: {
    scale: 1,
    x: '0%',
    filter: 'blur(0px)',
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? '100%' : '-100%',
      scale: 0.5,
      filter: 'blur(8px)',
      opacity: 0
    }
  }
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min

  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

interface MediaGalleryProps {
  attachments: MediaGalleryItemAttributes[]
  onRemoveItem?: (id: string) => void
  onReorder?: (ids: string[]) => void
  onOpenAttachment?: (attachmentId: string, galleryId?: string) => void
  dropzone?: DropzoneState
  galleryId?: string
  editable?: boolean
}

export function MediaGallery(props: MediaGalleryProps) {
  const { attachments, onOpenAttachment, galleryId, editable } = props
  const [[activeIndex, direction], setActiveIndex] = useState([0, 0])
  const [isDragging, setIsDragging] = useState(false)
  const [prefetchedAttachments, setPrefetchedAttachments] = useState<Set<string>>(new Set())
  const prefetchIndex = useRef(1)

  const imageIndex = wrap(0, attachments.length, activeIndex)

  const currentAttachment = useServerOrOptimisticAttachment({
    id: attachments[imageIndex]?.id,
    optimisticId: attachments[imageIndex]?.optimistic_id ?? ''
  })

  const nextAttachment = useServerOrOptimisticAttachment({
    id: attachments[imageIndex + 1]?.id,
    optimisticId: attachments[imageIndex + 1]?.optimistic_id ?? ''
  })

  useEffect(() => {
    const next = nextAttachment.attachment

    if (!next) return

    const nextIsVideo = next.video
    const nextRelativeUrl = next.relative_url

    if (nextRelativeUrl && !prefetchedAttachments.has(nextRelativeUrl)) {
      if (next.image_urls) prefetchPostImages(next.image_urls)
      if (nextIsVideo) prefetchPostVideo(nextRelativeUrl)

      setPrefetchedAttachments(new Set(prefetchedAttachments).add(nextRelativeUrl))
    }
  }, [prefetchedAttachments, nextAttachment, prefetchIndex])

  if (attachments.length === 0) return null

  const paginate = (newDirection: number) => {
    prefetchIndex.current = wrap(0, attachments.length, prefetchIndex.current + newDirection)
    setActiveIndex([activeIndex + newDirection, newDirection])
  }

  function renderActiveAttachment() {
    if (currentAttachment.attachment?.image) {
      return <ImageAttachment attachment={currentAttachment.attachment} maxHeight='34rem' />
    }

    if (currentAttachment.attachment?.video) {
      return <VideoAttachment attachment={currentAttachment.attachment} maxHeight='34rem' />
    }

    if (currentAttachment.attachment?.gif) {
      return <GifAttachment attachment={currentAttachment.attachment} maxHeight='34rem' />
    }

    if (currentAttachment.attachment?.origami) {
      return <OrigamiAttachment attachment={currentAttachment.attachment} />
    }

    if (currentAttachment.attachment?.principle) {
      return <PrincipleAttachment attachment={currentAttachment.attachment} />
    }

    if (currentAttachment.attachment?.stitch) {
      return <StitchAttachment attachment={currentAttachment.attachment} />
    }

    if (currentAttachment.attachment?.lottie) {
      return <LottieAttachment attachment={currentAttachment.attachment} />
    }
  }

  const onOpen = () => onOpenAttachment?.(currentAttachment.attachment?.id ?? '', galleryId)

  return (
    <div className='not-prose relative overflow-hidden rounded-md'>
      <div className='pointer-events-none absolute inset-0 z-[1] rounded-md ring-1 ring-inset ring-[--border-primary]' />

      <div className='bg-tertiary rounded-t-md'>
        <AnimatePresence mode='popLayout' initial={false} custom={direction}>
          <m.div
            className={cn('group relative flex h-[34rem] select-none items-center justify-center', {
              'pointer-events-none': isDragging
            })}
            key={activeIndex}
            initial='enter'
            animate='center'
            exit='exit'
            custom={direction}
            variants={variants}
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag={attachments.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            whileDrag={{ cursor: 'grabbing' }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_, { offset, velocity }) => {
              setIsDragging(false)
              const swipe = swipePower(offset.x, velocity.x)

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
          >
            <button type='button' onDoubleClick={editable ? onOpen : undefined} onClick={editable ? undefined : onOpen}>
              {renderActiveAttachment()}
            </button>
          </m.div>
        </AnimatePresence>
      </div>

      <CarouselPagination
        paginate={paginate}
        activeIndex={imageIndex}
        setActiveIndex={setActiveIndex}
        attachments={attachments}
        onRemoveItem={props.onRemoveItem}
        dropzone={props.dropzone}
        onReorder={props.onReorder}
      />
    </div>
  )
}
