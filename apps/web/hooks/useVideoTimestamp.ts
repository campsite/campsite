import { useEffect, useState } from 'react'

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  let formattedDuration = [minutes, seconds.toString().padStart(2, '0')].join(':')

  if (hours > 0) {
    formattedDuration = `${hours}:${formattedDuration}`
  }

  return formattedDuration
}

export function useVideoTimestamp(videoRef: React.RefObject<HTMLVideoElement>, initialDuration?: number) {
  const [duration, setDuration] = useState<string>(formatDuration(initialDuration ?? videoRef.current?.duration ?? 0))

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    const updateDuration = () => {
      if (!video) return

      const totalSeconds = Math.floor(video.duration - video.currentTime)

      if (isNaN(totalSeconds)) return

      setDuration(formatDuration(totalSeconds))
    }

    video?.addEventListener('timeupdate', updateDuration)

    updateDuration()

    return () => {
      video?.removeEventListener('timeupdate', updateDuration)
    }
  }, [videoRef])

  return duration
}
