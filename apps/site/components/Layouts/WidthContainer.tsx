import { cn } from '@campsite/ui/src/utils'

interface WidthContainerProps extends React.PropsWithChildren {
  className?: string
}

export function WidthContainer({ children, className }: WidthContainerProps) {
  return <div className={cn('mx-auto flex w-full max-w-7xl flex-col px-4 md:px-6 lg:px-8', className)}>{children}</div>
}
