/* eslint-disable @next/next/no-img-element */
import React, { useRef, useState } from 'react'
import { isSafari } from 'react-device-detect'

import { Attachment } from '@campsite/types'
import { cn, ConditionalWrap } from '@campsite/ui/utils'

import { PostAttachmentLightbox } from '@/components/AttachmentLightbox/PostAttachmentLightbox'
import { LottieAttachment } from '@/components/Thread/Bubble/AttachmentCard/LottieAttachment'
import { useVideoTimestamp } from '@/hooks/useVideoTimestamp'

function borderRadiusClassName(index: number, mediaCount: number) {
  if (mediaCount === 1) {
    return 'rounded-md'
  }

  if (mediaCount === 2) {
    return {
      'rounded-l-md': index === 0,
      'rounded-r-md': index === 1
    }
  }

  if (mediaCount === 3) {
    return {
      'rounded-tl-md': index === 0,
      'rounded-bl-md': index === 1,
      'rounded-r-md': index === 2
    }
  }

  return {
    'rounded-tl-md': index === 0,
    'rounded-bl-md': index === 1,
    'rounded-tr-md': index === 2,
    'rounded-br-md': index === 3
  }
}

function MediaThumbnail({
  attachment,
  imageClassName = '',
  containerClassName = '',
  index = 0,
  mediaCount = 0,
  isSingle = false,
  hideVideoTimestamp = false,
  autoPlayVideo = true,
  setSelectedPostAttachmentId
}: {
  attachment: Attachment
  imageClassName?: string
  containerClassName?: string
  index?: number
  mediaCount?: number
  isSingle?: boolean
  hideVideoTimestamp?: boolean
  autoPlayVideo?: boolean
  setSelectedPostAttachmentId: (id: string | undefined) => void
}) {
  const src = attachment.url

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const timestamp = useVideoTimestamp(videoRef, Math.floor(attachment.duration / 1000))
  const showVideoControls = isSingle
  const autoPlay = isSingle && index === 0 && autoPlayVideo

  return (
    <div
      className={cn(
        'group relative',
        borderRadiusClassName(index, mediaCount),
        {
          'row-span-2': index === 2 && mediaCount === 3
        },
        containerClassName
      )}
    >
      <ConditionalWrap
        // a single video should just display the player and not link to the post
        condition={!(isSingle && attachment.video)}
        wrap={(c) => <button onClick={() => setSelectedPostAttachmentId(attachment.id)}>{c}</button>}
      >
        <>
          {(attachment.image || attachment.gif) && (
            <img
              src={src}
              alt={attachment.name ?? ''}
              className={cn(imageClassName, 'm-0 object-top', borderRadiusClassName(index, mediaCount), {
                'absolute inset-0 h-full w-full object-cover': !isSingle,
                // single images should be full width but not taller than 500px
                'mx-auto h-auto max-h-[500px] object-contain': isSingle
              })}
            />
          )}
          {attachment.video && (
            <video
              ref={videoRef}
              muted
              autoPlay={autoPlay}
              playsInline
              key={src}
              controls={showVideoControls}
              preload='auto'
              className={cn(
                'focus:online-none focus:border-0 focus-visible:outline-none',
                borderRadiusClassName(index, mediaCount),
                {
                  'h-auto max-h-[500px] w-full object-contain object-top': isSingle,
                  'absolute inset-0 h-full w-full object-cover': !isSingle
                }
              )}
              onClick={() => {
                if (!videoRef.current) return

                /**
                 * Clicking a single video should toggle play/pause, otherwise it should open the lightbox.
                 *
                 * Note: Safari already has a built-in play/pause on click. Instead of trying to prevent
                 * default behavior, it's easier to add a userAgent check.
                 */
                if (isSingle && !isSafari) {
                  videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()
                }
              }}
            >
              <source src={src} type={attachment.file_type} />
              <source src={src} />
            </video>
          )}

          {attachment.video && !isSingle && !hideVideoTimestamp && (
            <div className='absolute bottom-0 left-0 font-mono'>
              <AttachmentAccessory>{timestamp}</AttachmentAccessory>
            </div>
          )}

          {attachment.lottie && <LottieAttachment attachment={attachment} />}
        </>
      </ConditionalWrap>
    </div>
  )
}

interface AttachmentGalleryProps {
  /**
   * The ID of the post the attachments belong to. Required for comments, too.
   * Used to build modal links for attachments.
   */
  postId: string
  attachments: Attachment[]
  autoPlayVideo?: boolean
}

export function AttachmentGrid({ postId, attachments, autoPlayVideo }: AttachmentGalleryProps) {
  const [selectedPostAttachmentId, setSelectedPostAttachmentId] = useState<string | undefined>()

  if (!attachments.length) return null

  const maxInlineCount = 4
  const mediaToDisplay = attachments.slice(0, maxInlineCount)
  const mediaCount = mediaToDisplay.length
  const extraCount = attachments.length - maxInlineCount
  const hasMore = extraCount > 0

  return (
    <>
      <PostAttachmentLightbox
        postId={postId}
        selectedAttachmentId={selectedPostAttachmentId}
        setSelectedAttachmentId={setSelectedPostAttachmentId}
      />

      <div
        className={cn('relative w-full', {
          'ring-neutral-150 bg-neutral-150 grid auto-rows-fr gap-px rounded-md ring-1 dark:bg-neutral-700/50 dark:ring-neutral-700/50':
            mediaCount >= 2,
          'grid-cols-2': mediaCount === 2,
          // use a shorter grid for 2 files to avoid awkwardly tall portrait images
          'aspect-[2/1]': mediaCount === 2,
          'h-[500px] grid-flow-col grid-cols-2 grid-rows-2': mediaCount >= 3
        })}
      >
        {mediaToDisplay.map((media, index) => (
          <MediaThumbnail
            key={media.id}
            attachment={media}
            index={index}
            mediaCount={mediaCount}
            isSingle={mediaCount === 1}
            autoPlayVideo={autoPlayVideo}
            setSelectedPostAttachmentId={setSelectedPostAttachmentId}
          />
        ))}
        {hasMore && (
          <div className='absolute bottom-0 right-0'>
            <button className='hover:underline' onClick={() => setSelectedPostAttachmentId(attachments[0].id)}>
              <AttachmentAccessory>+{extraCount} more&hellip;</AttachmentAccessory>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function AttachmentAccessory({ children }: React.PropsWithChildren) {
  return (
    <div className='m-1 flex h-6 items-center justify-center rounded-md bg-black px-2 text-xs font-bold text-white'>
      <span className='whitespace-nowrap'>{children}</span>
    </div>
  )
}
