import { MouseEvent, useState } from 'react'

import { Attachment } from '@campsite/types'
import { Button, PauseIcon, PlayIcon } from '@campsite/ui'

import { Lottie } from '@/components/Lottie'

interface Props {
  attachment: Attachment
  onError?: () => void
}

export function LottieAttachment(props: Props) {
  const { attachment, onError } = props

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

  return (
    <>
      <div className='dark absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
        <Button
          className='shadow-popover'
          iconOnly={isPlaying ? <PauseIcon /> : <PlayIcon />}
          onClick={togglePlay}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        />
      </div>
      <div className='relative flex aspect-video h-full max-h-[44rem] w-full flex-col items-center justify-center p-4 max-lg:min-h-[256px]'>
        <Lottie key={attachment.id} url={attachment.url} onLoad={setAnimationItem} onError={onError} />
      </div>
    </>
  )
}
