import { UIText } from '../Text'
import { Tooltip } from '../Tooltip'
import { cn, ConditionalWrap } from '../utils'

type Color = 'default' | 'blue' | 'green' | 'brand' | 'orange' | 'amber'

export function Badge({
  children,
  color = 'default',
  icon,
  className,
  tooltip
}: {
  children: React.ReactNode
  color?: Color
  icon?: React.ReactNode
  className?: string
  tooltip?: string
}) {
  const BG_STYLE: Record<Color, string> = {
    default: 'bg-black/5 dark:bg-white/10',
    blue: 'bg-blue-50 dark:bg-blue-500/20',
    green: 'bg-green-500 dark:bg-green-900/50',
    brand: 'bg-brand-primary dark:bg-brand-primary/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    amber: 'bg-amber-500 dark:bg-amber-900/40'
  }

  const TEXT_STYLE: Record<Color, string> = {
    default: 'text-tertiary',
    blue: 'text-blue-500 dark:text-blue-400',
    green: 'text-white dark:text-green-400',
    brand: 'text-white dark:text-orange-300',
    orange: 'text-orange-800 dark:text-orange-300',
    amber: 'text-white dark:text-amber-300'
  }

  return (
    <ConditionalWrap condition={!!tooltip} wrap={(children) => <Tooltip label={tooltip}>{children}</Tooltip>}>
      <span
        className={cn(
          'min-h-4.5 flex flex-none items-center justify-center rounded px-1.5 pb-px pt-0.5 uppercase',
          BG_STYLE[color],
          TEXT_STYLE[color],
          icon && 'gap-0.5 pl-1',
          className
        )}
      >
        {icon && icon}
        <UIText inherit weight='font-semibold' size='text-[10px]' className='flex-none leading-none'>
          {children}
        </UIText>
      </span>
    </ConditionalWrap>
  )
}
