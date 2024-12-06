import { cn } from '@campsite/ui/utils'

interface TimelineEventParagraphContainerProps extends React.PropsWithChildren {
  className?: string
}

export function TimelineEventParagraphContainer({ children, className }: TimelineEventParagraphContainerProps) {
  return <p className={cn('break-anywhere pt-0.5 text-[13px] leading-5', className)}>{children}</p>
}
