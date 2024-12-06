import { cn } from '../utils'

interface Props {
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
}

export function Checkbox(props: Props) {
  const { checked, onChange, disabled, id, className } = props

  return (
    <input
      id={id}
      className={cn(
        'bg-elevated border-primary h-5 w-5 max-w-xs cursor-pointer rounded border focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0 dark:focus:border-blue-400 dark:focus:ring-blue-600/20',
        className
      )}
      type='checkbox'
      onChange={(e) => onChange?.(e.target.checked)}
      checked={checked}
      disabled={disabled}
    />
  )
}
