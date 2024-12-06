import { useEffect, useRef, useState } from 'react'
import LottieLight from 'react-lottie-player/dist/LottiePlayerLight'

interface Props {
  url: string
  onLoad?: (animationItem: any) => void
  onError?: () => void
  onFrame?: (frame: number) => void
  className?: string
}

export function Lottie(props: Props) {
  const { url, onLoad, onError, onFrame, className = 'w-full h-full' } = props
  const ref = useRef(null)
  const [animationItem, setAnimationItem] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [_frame, setFrame] = useState(0)

  useEffect(() => {
    if (loaded) {
      const player = ref.current as any

      setAnimationItem(player)
      onLoad?.(player)
    }
  }, [ref, loaded, onLoad])

  const handleLoad = () => {
    setLoaded(true)
  }

  const handleEnterFrame = () => {
    const percentage = (animationItem?.currentFrame / animationItem?.totalFrames) * 100

    setFrame(percentage)
    onFrame?.(percentage)
  }

  return (
    <LottieLight
      ref={ref}
      path={url}
      play
      loop
      onEnterFrame={handleEnterFrame}
      onLoad={handleLoad}
      onError={onError}
      className={className}
    />
  )
}
