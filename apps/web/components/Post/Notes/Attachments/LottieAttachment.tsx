import { MouseEvent, useState } from 'react'

import { Attachment } from '@campsite/types'
import { Button, PauseIcon, PlayIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { Lottie } from '@/components/Lottie'
import { Accessory } from '@/components/Thread/Bubble/AttachmentCard'

interface Props {
  attachment: Attachment
  isUploading: boolean
}

export function LottieAttachment(props: Props) {
  const { attachment, isUploading } = props

  const [isPlaying, setIsPlaying] = useState(true)
  const [animationItem, setAnimationItem] = useState<any>(null)

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

  const src = attachment.optimistic_src || attachment.url

  return (
    <>
      {animationItem && (
        <div className='dark absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <Button
            className='shadow-popover focus-visible:ring-0'
            iconOnly={isPlaying ? <PauseIcon /> : <PlayIcon />}
            onClick={togglePlay}
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          />
        </div>
      )}

      <div
        draggable={false}
        className={cn(
          'bg-quaternary relative flex h-full w-full flex-col items-center justify-center rounded p-4 max-lg:min-h-[256px]',
          {
            'opacity-30': isUploading
          }
        )}
      >
        {src && <Lottie url={src} onLoad={setAnimationItem} />}

        {!src && (
          <div
            style={{ width: 500, height: 375 }}
            className='bg-quaternary relative w-full max-w-full rounded object-contain'
          />
        )}

        <div className='pointer-events-none absolute left-2 top-2 z-[2] flex items-center gap-0.5'>
          <Accessory label='LOTTIE' />
        </div>
      </div>
    </>
  )
}
