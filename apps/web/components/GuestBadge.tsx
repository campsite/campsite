import { Badge } from '@campsite/ui/Badge'
import { cn } from '@campsite/ui/utils'

export function GuestBadge({ size = 'sm', className }: { size?: 'xs' | 'sm'; className?: string }) {
  if (size === 'xs') {
    return (
      <Badge tooltip='Guest' className={cn('w-4.5 h-4.5', className)} color='amber'>
        G
      </Badge>
    )
  }
  if (size === 'sm') {
    return (
      <Badge className={cn(className)} color='amber'>
        Guest
      </Badge>
    )
  }
}
