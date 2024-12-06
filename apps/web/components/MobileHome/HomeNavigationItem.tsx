import { cn, Link, UIText } from '@campsite/ui'

interface Props {
  label: string
  labelAccessory?: React.ReactNode
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  unread?: boolean
}

export function HomeNavigationItem({ label, labelAccessory, icon, href, onClick, unread = false }: Props) {
  if (href) {
    return (
      <Link
        onClick={onClick}
        href={href}
        className={cn('flex items-center gap-3 px-4 py-2.5', {
          'text-tertiary': !unread,
          'text-primary': unread
        })}
      >
        <span className='flex h-6 w-6 flex-none items-center justify-center'>{icon}</span>
        <UIText size='text-base' weight={unread ? 'font-semibold' : 'font-normal'} className='line-clamp-1' inherit>
          {label}
        </UIText>
        {labelAccessory && <span>{labelAccessory}</span>}
      </Link>
    )
  }
  return (
    <button
      onClick={onClick}
      className={cn('flex items-center gap-3 px-4 py-2.5', {
        'text-tertiary': !unread,
        'text-primary': unread
      })}
    >
      <span className='flex h-6 w-6 flex-none items-center justify-center'>{icon}</span>
      <UIText size='text-base' weight={unread ? 'font-semibold' : 'font-normal'} className='line-clamp-1' inherit>
        {label}
      </UIText>
      {labelAccessory && <span>{labelAccessory}</span>}
    </button>
  )
}
