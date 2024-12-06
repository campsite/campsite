import { Badge } from '@campsite/ui/Badge'
import { cn } from '@campsite/ui/utils'

export function AppBadge({ size = 'sm', className }: { size?: 'xs' | 'sm'; className?: string }) {
  if (size === 'xs') {
    return (
      <Badge tooltip='App' className={cn('w-4.5 h-4.5', className)} color='blue'>
        A
      </Badge>
    )
  }
  if (size === 'sm') {
    return (
      <Badge className={cn(className)} color='blue'>
        App
      </Badge>
    )
  }
}
