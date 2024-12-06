import { cn } from '@campsite/ui'

interface SidebarUnreadBadgeProps extends React.PropsWithChildren {
  important: boolean
}

export function SidebarUnreadBadge({ children, important }: SidebarUnreadBadgeProps) {
  return (
    <div
      className={cn('pointer-events-none flex-none rounded-full px-1.5 py-px font-mono text-[10px] font-bold', {
        'bg-blue-500 text-white': important,
        'text-secondary bg-quaternary': !important
      })}
    >
      {children}
    </div>
  )
}
