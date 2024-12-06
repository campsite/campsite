import { MouseEvent, useEffect, useRef, useState } from 'react'
import { Slider } from '@radix-ui/react-slider'
import QRCode from 'react-qr-code'

import { Attachment, Post } from '@campsite/types'
import { Button, DownloadIcon, ExternalLinkIcon, Link, PauseIcon, PlayIcon, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { CanvasComments } from '@/components/CanvasComments/CanvasComments'
import { Lottie } from '@/components/Lottie'
import { stableId } from '@/components/Post/PostReorderableAttachments'
import { LinkAttachment } from '@/components/Thread/Bubble/AttachmentCard/LinkAttachment'
import { useFigmaEmbedSelected } from '@/hooks/useFigmaEmbedSelected'
import { isRenderable } from '@/utils/attachments'
import { getFileMetadata } from '@/utils/getFileMetadata'

import { FileTypeIcon } from '../FileTypeIcon'

interface Props {
  attachment: Attachment
  preventNewComment?: boolean
  post?: Post
}

export function LightboxAttachmentRenderer({ attachment, preventNewComment, post }: Props) {
  const figmaEmbedSelected = useFigmaEmbedSelected({ attachment })

  if (attachment.video) {
    return <VideoRenderer post={post} attachment={attachment} />
  }
  if (attachment.origami) {
    return <OrigamiRenderer attachment={attachment} />
  }
  if (attachment.principle) {
    return <PrincipleRenderer attachment={attachment} />
  }
  if (attachment.stitch) {
    return <StitchRenderer attachment={attachment} />
  }
  if (attachment.lottie) {
    return <LottieRenderer attachment={attachment} />
  }
  if (attachment.gif) {
    return <GifRenderer attachment={attachment} />
  }
  if (attachment.link) {
    return <LinkAttachment selfSize={true} attachment={attachment} />
  }
  if (attachment.image && attachment.remote_figma_url) {
    return (
      <>
        <div className={cn('absolute inset-0', { 'opacity-0': !figmaEmbedSelected })}>
          <LinkAttachment selfSize={true} attachment={attachment} />
        </div>
        {!figmaEmbedSelected && <CanvasComments attachment={attachment} preventNewComment={preventNewComment} />}
      </>
    )
  }
  if (!isRenderable(attachment)) {
    const metadata = getFileMetadata(attachment)

    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-1'>
        <FileTypeIcon {...metadata} />
        <UIText secondary className='mb-2 font-mono'>
          {metadata.name}
        </UIText>
        <Button href={metadata.downloadUrl} download={attachment.name || 'file'} leftSlot={<DownloadIcon />}>
          Download
        </Button>
      </div>
    )
  }

  return <CanvasComments attachment={attachment} preventNewComment={preventNewComment} />
}

function GifRenderer({ attachment }: Props) {
  const src = `${attachment.url}?fm=mp4`

  return (
    // this key prop is necessary to force a re-render when the video src changes
    // e.g. when two videos were uploaded sequentially and the user clicks between them
    <div className='m-auto flex h-full w-full items-center justify-center'>
      <video
        muted
        autoPlay
        playsInline
        loop
        key={stableId(attachment)}
        width={attachment.width}
        height={attachment.height}
        controls={false}
        preload='auto'
        className='h-auto max-h-full w-auto max-w-full'
      >
        <source src={src} type={'video/mp4'} />
        <source src={src} />
      </video>
    </div>
  )
}

async function playVideo(video: HTMLVideoElement) {
  try {
    await video.play()
  } catch {
    // noop
  }
}

function VideoRenderer({ attachment, post }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const attachmentId = attachment.optimistic_id ?? attachment.id

  // whenever the file changes, focus the video and play it
  // force it to pause if the component unmounts or the files changes
  useEffect(() => {
    const video = videoRef.current

    if (video && !post?.viewer_is_author) {
      video.focus()
      playVideo(video)

      return () => {
        video.pause()
        video.blur()
      }
    }
  }, [attachmentId, attachment.subject_id, post?.viewer_is_author])

  const src = attachment.optimistic_src ?? attachment.url

  if (!src) return null

  return (
    <video
      key={stableId(attachment)}
      loop={(attachment.duration ?? 0) < 60000} // loop if less than one minute
      width={attachment.width}
      height={attachment.height}
      ref={videoRef}
      controls={true}
      preload='auto'
      className='focus:online-none aspect-video h-full w-full bg-black focus:border-0 focus-visible:outline-none'
    >
      <source src={src} type={attachment.file_type} />
      <source src={src} />
    </video>
  )
}

function OrigamiRenderer({ attachment }: Props) {
  if (!attachment.download_url) return null

  const origamiUrl = attachment.download_url.replace('https', 'origami-public')

  return (
    <div className='flex flex-1 items-center justify-center'>
      <div
        className='relative inline-flex w-[90%] flex-col items-center justify-center space-y-6 p-6 md:w-[50%]'
        key={stableId(attachment)}
      >
        <QRCode size={256} value={origamiUrl} />

        <div className='flex flex-col items-center justify-center space-x-0 space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0'>
          <Button href={attachment.download_url} download={attachment.name || 'file'} leftSlot={<DownloadIcon />}>
            Download
          </Button>
          <Button leftSlot={<ExternalLinkIcon />} href={origamiUrl} externalLink>
            Open
          </Button>
        </div>

        <UIText tertiary>
          <Link
            href='https://fb.me/getorigamistudio'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-primary'
          >
            Origami Studio
          </Link>
          {' · '}
          <Link
            href='https://apps.apple.com/us/app/origami-live/id942636206'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-primary'
          >
            Origami Live
          </Link>
        </UIText>
      </div>
    </div>
  )
}

function PrincipleRenderer({ attachment }: Props) {
  if (!attachment.download_url) return null

  const principleUrl = attachment.download_url.replace('https', 'principle')

  return (
    <div className='flex flex-1 items-center justify-center'>
      <div
        className='relative inline-flex w-[90%] flex-col items-center justify-center space-y-6 p-6 md:w-[50%]'
        key={stableId(attachment)}
      >
        <QRCode size={256} value={principleUrl} />

        <div className='flex flex-col items-center justify-center space-x-0 space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0'>
          <Button href={attachment.download_url} download={attachment.name || 'file'} leftSlot={<DownloadIcon />}>
            Download
          </Button>
          <Button leftSlot={<ExternalLinkIcon />} href={principleUrl} externalLink>
            Open
          </Button>
        </div>

        <UIText tertiary>
          <Link
            href='https://principleformac.com/'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-primary'
          >
            Principle for Mac
          </Link>
          {' · '}
          <Link
            href='https://apps.apple.com/us/app/principle-mirror/id991911319'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-primary'
          >
            Principle for iOS
          </Link>
        </UIText>
      </div>
    </div>
  )
}

function StitchRenderer({ attachment }: Props) {
  if (!attachment.download_url) return null

  const stitchUrl = attachment.download_url.replace('https', 'stitch')

  return (
    <div className='flex flex-1 items-center justify-center'>
      <div
        className='relative inline-flex w-[90%] flex-col items-center justify-center space-y-6 p-6 md:w-[50%]'
        key={stableId(attachment)}
      >
        <QRCode size={256} value={stitchUrl} />

        <div className='flex flex-col items-center justify-center space-x-0 space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0'>
          <Button href={attachment.download_url} download={attachment.name || 'file'} leftSlot={<DownloadIcon />}>
            Download
          </Button>
          <Button leftSlot={<ExternalLinkIcon />} href={stitchUrl} externalLink>
            Open
          </Button>
        </div>
      </div>
    </div>
  )
}

function LottieRenderer({ attachment }: Props) {
  const [animationItem, setAnimationItem] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [frame, setFrame] = useState(0)

  function togglePlay(e: MouseEvent) {
    e.stopPropagation()
    e.preventDefault()

    if (animationItem?.isPaused) {
      setIsPlaying(true)
      animationItem?.play()
    } else {
      setIsPlaying(false)
      animationItem?.pause()
    }
  }

  const handleEnterFrame = (percentage: number) => {
    setFrame(percentage)
  }

  if (!attachment.download_url) return null

  return (
    <div
      onClick={togglePlay}
      className='group relative inline-flex h-full w-full items-center justify-center object-contain p-4'
    >
      <Lottie
        key={stableId(attachment)}
        url={attachment.download_url}
        onFrame={handleEnterFrame}
        onLoad={setAnimationItem}
        className='h-full'
      />

      <div className='bg-elevated absolute bottom-4 left-4 z-10 flex w-[calc(100%-32px)] items-center justify-center gap-3 rounded-lg p-4 align-middle opacity-0 transition-all duration-300 group-hover:opacity-100'>
        <Button
          variant='primary'
          onClick={togglePlay}
          key={`${isPlaying}`}
          iconOnly={animationItem?.isPaused ? <PlayIcon /> : <PauseIcon />}
          accessibilityLabel={animationItem?.isPaused ? 'Play' : 'Pause'}
        />
        <Slider
          defaultValue={[0]}
          value={[frame]}
          max={100}
          step={1}
          onClick={(e: MouseEvent) => e.stopPropagation()}
          onValueChange={(value: number[]) => {
            animationItem?.goToAndStop((value[0] / 100) * animationItem?.totalFrames, true)
            setFrame(value[0])
          }}
        />
      </div>
    </div>
  )
}
