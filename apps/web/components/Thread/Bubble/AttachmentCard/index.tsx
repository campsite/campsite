import { useState } from 'react'
import Image from 'next/image'

import { Attachment } from '@campsite/types'
import { PhotoHideIcon } from '@campsite/ui'

import { GifAttachment } from '@/components/Thread/Bubble/AttachmentCard/GifAttachment'
import { ImageAttachment } from '@/components/Thread/Bubble/AttachmentCard/ImageAttachment'
import { LinkAttachmentStatic } from '@/components/Thread/Bubble/AttachmentCard/LinkAttachmentStatic'
import { LottieAttachment } from '@/components/Thread/Bubble/AttachmentCard/LottieAttachment'
import { OrigamiAttachment } from '@/components/Thread/Bubble/AttachmentCard/OrigamiAttachment'
import { PrincipleAttachment } from '@/components/Thread/Bubble/AttachmentCard/PrincipleAttachment'
import { StitchAttachment } from '@/components/Thread/Bubble/AttachmentCard/StitchAttachment'
import { VideoAttachment } from '@/components/Thread/Bubble/AttachmentCard/VideoAttachment'

function getApproximateAspectRatio(val: number, lim = 10) {
  var lower = [0, 1]
  var upper = [1, 0]

  // eslint-disable-next-line no-constant-condition
  while (true) {
    var mediant = [lower[0] + upper[0], lower[1] + upper[1]]

    if (val * mediant[1] > mediant[0]) {
      if (lim < mediant[1]) {
        return upper
      }
      lower = mediant
    } else if (val * mediant[1] == mediant[0]) {
      if (lim >= mediant[1]) {
        return mediant
      }
      if (lower[1] < upper[1]) {
        return lower
      }
      return upper
    } else {
      if (lim < mediant[1]) {
        return lower
      }
      upper = mediant
    }
  }
}

function attachmentShouldCover(attachment: Attachment) {
  if (!attachment.video && !attachment.gif) return false

  const approximateAspectRatio = getApproximateAspectRatio(attachment.width / attachment.height)
  const approximatelyVideo = [
    [16, 9],
    [4, 3],
    [3, 2],
    [2, 1]
  ]
  const shouldCover = approximatelyVideo.some((aspectRatio) => {
    return approximateAspectRatio[0] === aspectRatio[0] && approximateAspectRatio[1] === aspectRatio[1]
  })

  return shouldCover
}

interface Props {
  attachment: Attachment
  autoplay?: boolean
}

export function AttachmentCard({ attachment, autoplay }: Props) {
  const cover = attachmentShouldCover(attachment)
  const [hasErrored, setHasErrored] = useState(false)

  function handleError() {
    setHasErrored(true)
  }

  if (hasErrored) {
    return (
      <div className='bg-secondary text-tertiary flex h-full w-full items-center justify-center'>
        <PhotoHideIcon size={32} />
      </div>
    )
  }

  if (attachment.image) {
    return <ImageAttachment attachment={attachment} selfSize cover onError={handleError} />
  }

  if (attachment.video) {
    return (
      <div
        className='relative flex max-h-[44rem] w-full items-center justify-center'
        style={{ aspectRatio: `${attachment.width} / ${attachment.height}` }}
      >
        {attachment.preview_thumbnail_url && !cover && (
          <Image
            aria-hidden='true'
            alt='Preview thumbnail'
            src={attachment.preview_thumbnail_url}
            width={attachment.width}
            height={attachment.height}
            className='absolute inset-0 z-0 opacity-10 blur-xl'
            onError={handleError}
          />
        )}
        <VideoAttachment selfSize attachment={attachment} cover={cover} autoplay={autoplay} />
      </div>
    )
  }

  if (attachment.gif) {
    return (
      <div className='relative flex h-full w-full items-center justify-center'>
        {attachment.preview_thumbnail_url && !cover && (
          <Image
            aria-hidden='true'
            alt='Preview thumbnail'
            src={attachment.preview_thumbnail_url}
            width={attachment.width}
            height={attachment.height}
            className='absolute inset-0 z-0 opacity-10 blur-xl'
            onError={handleError}
          />
        )}
        <GifAttachment selfSize attachment={attachment} cover={cover} />
      </div>
    )
  }

  if (attachment.lottie) {
    return <LottieAttachment attachment={attachment} onError={handleError} />
  }

  if (attachment.origami) {
    return <OrigamiAttachment attachment={attachment} preview />
  }

  if (attachment.principle) {
    return <PrincipleAttachment attachment={attachment} preview />
  }

  if (attachment.stitch) {
    return <StitchAttachment attachment={attachment} preview />
  }

  if (attachment.link) {
    return <LinkAttachmentStatic attachment={attachment} onError={handleError} />
  }

  return null
}

export function Accessory({ label }: { label: string }) {
  return (
    <div className='dark:bg-elevated rounded-md bg-black px-2 py-1 text-center font-mono text-[11px] text-xs font-semibold text-white'>
      {label}
    </div>
  )
}
