import { cn } from '@campsite/ui/src/utils'

interface Props {
  className?: string
  videoId: string
}

export function YouTubePreview({ className, videoId }: Props) {
  return (
    <iframe
      className={cn('aspect-video w-full overflow-visible rounded-md', className)}
      src={`https://www.youtube.com/embed/${videoId}`}
      allowFullScreen
      title='YouTube Video'
      sandbox='allow-scripts allow-same-origin allow-popups allow-presentation'
      frameBorder='0'
      scrolling='no'
    />
  )
}
