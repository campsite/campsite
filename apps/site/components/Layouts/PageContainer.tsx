import { cn } from '@campsite/ui/src/utils'

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-1 flex-col', className)}>{children}</div>
}
