import { cn } from '@campsite/ui/src/utils'

interface Props {
  className?: string
  videoId: string
}

export function TellaPreview({ className, videoId }: Props) {
  return (
    <iframe
      className={cn('aspect-video w-full overflow-visible rounded-md', className)}
      src={`https://www.tella.tv/video/${videoId}/embed?title=0`}
      allowFullScreen
      title='Tella Video'
      sandbox='allow-scripts allow-same-origin allow-popups allow-presentation'
      frameBorder='0'
      scrolling='no'
    />
  )
}
