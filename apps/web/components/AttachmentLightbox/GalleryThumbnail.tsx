import { useState } from 'react'
import Image from 'next/image'

import { Attachment, ImageUrls } from '@campsite/types'
import { LinkIcon, PhotoHideIcon, PlayIcon } from '@campsite/ui'

import { getFileMetadata } from '@/utils/getFileMetadata'

import { FileTypeIcon } from '../FileTypeIcon'
import { embedType, transformUrl } from '../Post/PostEmbeds/transformUrl'

const THUMBNAIL_SIZE = 36

export function GalleryThumbnail({ attachment, size }: { attachment: Attachment; size?: number; prefetch?: boolean }) {
  const thumbnailSize = size ?? THUMBNAIL_SIZE
  const urlKey: keyof ImageUrls = size ? 'feed_url' : 'thumbnail_url'
  const previewUrlKey: keyof Attachment = size ? 'preview_url' : 'preview_thumbnail_url'
  const [hasErrored, setHasErrored] = useState(false)

  function handleError() {
    setHasErrored(true)
  }

  if (hasErrored) {
    return (
      <div className='bg-secondary text-tertiary flex h-full w-full items-center justify-center p-8'>
        <PhotoHideIcon />
      </div>
    )
  }

  if (attachment.image) {
    const src = attachment.optimistic_src ?? attachment.image_urls?.[urlKey]

    if (!src) return null
    return (
      <Image
        src={src}
        width={thumbnailSize}
        height={thumbnailSize}
        alt='Preview for image'
        className='h-full w-full object-cover'
        draggable={false}
        onError={handleError}
      />
    )
  } else if (attachment.gif) {
    let src = attachment.optimistic_src ?? attachment.url

    if (!src) return null

    if (attachment.id !== attachment.optimistic_id) {
      src = `${attachment.url}?fm=mp4`
    }

    if (attachment.optimistic_id === attachment.id) {
      return (
        <>
          <div className='pointer-events-none absolute bottom-1.5 left-1.5 rounded-md bg-black px-1 py-0.5 text-center font-mono text-[10px] font-bold text-white'>
            GIF
          </div>
          <Image
            src={src}
            width={thumbnailSize}
            height={thumbnailSize}
            alt='Preview for image'
            className='h-full w-full object-cover'
            draggable={false}
            onError={handleError}
          />
        </>
      )
    }

    return (
      <>
        <div className='pointer-events-none absolute bottom-1.5 left-1.5 rounded-md bg-black px-1 py-0.5 text-center font-mono text-[10px] font-bold text-white'>
          GIF
        </div>
        <video
          muted
          autoPlay
          loop
          playsInline
          key={src}
          width={attachment.width}
          height={attachment.height}
          controls={false}
          preload='auto'
          draggable={false}
          className='focus:online-none h-full w-full bg-black object-cover focus:border-0 focus-visible:outline-none'
          onError={handleError}
        >
          <source src={src} type={'video/mp4'} />
          <source src={src} />
        </video>
      </>
    )
  } else if (attachment.video) {
    const src = attachment.optimistic_preview_src ?? attachment[previewUrlKey]

    if (!src) return null
    return (
      <>
        <div className='pointer-events-none absolute bottom-1.5 left-1.5 rounded-md bg-black px-0.5 py-0.5 text-white'>
          <PlayIcon size={15} />
        </div>
        <Image
          src={src}
          width={thumbnailSize}
          height={thumbnailSize}
          alt='Preview for video'
          className='h-full w-full object-cover'
          draggable={false}
          onError={handleError}
        />
      </>
    )
  } else if (attachment.lottie) {
    const src = attachment.optimistic_preview_src ?? attachment[previewUrlKey]

    return (
      <>
        <div className='pointer-events-none absolute bottom-1.5 left-1.5 rounded-md bg-black px-1 py-0.5 text-center font-mono text-[10px] font-bold text-white'>
          LOTTIE
        </div>
        <Image
          src={src ?? '/img/lottie.png'}
          width={thumbnailSize}
          height={thumbnailSize}
          alt='Preview for Lottie file'
          className='h-full w-full object-cover'
          draggable={false}
          onError={handleError}
        />
      </>
    )
  } else if (attachment.origami) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <Image
          width={thumbnailSize}
          height={thumbnailSize}
          alt='Origami prototype'
          src={'/img/origami.png'}
          className='h-8 w-8'
          draggable={false}
          onError={handleError}
        />
      </div>
    )
  } else if (attachment.principle) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <Image
          width={thumbnailSize}
          height={thumbnailSize}
          alt='Principle prototype'
          src={'/img/principle.png'}
          className='h-8 w-8'
          draggable={false}
          onError={handleError}
        />
      </div>
    )
  } else if (attachment.stitch) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <Image
          width={thumbnailSize}
          height={thumbnailSize}
          alt='Stitch prototype'
          src={'/img/stitch.png'}
          className='h-8 w-8'
          draggable={false}
          onError={handleError}
        />
      </div>
    )
  } else if (attachment.link && attachment.url) {
    const linkType = embedType(attachment.url)
    const { logo, title } = transformUrl(linkType, attachment.url)
    const src = attachment.optimistic_preview_src ?? attachment.preview_url
    const isOptimistic = attachment.optimistic_preview_src && attachment.id === attachment.optimistic_id

    /*
      If we created the attachment successfully, but couldn't generate a preview
      thumbnail, then fall back to showing a link icon with an optional logo
      if we recognize the service.
    */
    if (!src && !isOptimistic) {
      return (
        <div className='text-tertiary flex h-full w-full items-center justify-center'>
          {logo && title && (
            <Image
              width={24}
              height={24}
              alt='Link attachment'
              src={logo}
              className='pointer-events-none rounded-md'
              draggable={false}
              onError={handleError}
            />
          )}
          {!title && <LinkIcon />}
        </div>
      )
    }

    // If we reach this, we know we were able to generate a preview thumbnail
    return (
      <>
        {logo && (
          <Image
            width={19}
            height={19}
            alt='Link attachment'
            src={logo}
            className='pointer-events-none absolute bottom-1.5 left-1.5 rounded-md'
            draggable={false}
            onError={handleError}
          />
        )}
        {src && (
          <Image
            width={thumbnailSize}
            height={thumbnailSize}
            alt='Link attachment'
            src={src ?? logo}
            className='h-full w-full object-cover'
            draggable={false}
            onError={handleError}
          />
        )}
      </>
    )
  }

  const metadata = getFileMetadata(attachment)

  return (
    <div className='bg-elevated flex h-full w-full items-center justify-center'>
      <FileTypeIcon {...metadata} />
    </div>
  )
}
