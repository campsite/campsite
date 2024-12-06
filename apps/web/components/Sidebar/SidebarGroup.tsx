import { cn } from '@campsite/ui/src/utils'

export function SidebarGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-px px-3 py-2', className)}>{children}</div>
}
