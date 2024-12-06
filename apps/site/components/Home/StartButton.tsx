import { ArrowRightCircleIcon, Button, ButtonProps } from '@campsite/ui'

export function StartButton({
  className,
  variant = 'brand',
  label = 'Start for free',
  rightSlot = <ArrowRightCircleIcon size={28} />,
  fullWidth = true
}: {
  className?: string
  variant?: ButtonProps['variant']
  label?: string
  rightSlot?: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <Button
      size='large'
      variant={variant}
      // IMPORTANT: This is connected to Google Tag Manager and must not change
      href='/start'
      rightSlot={rightSlot}
      className={className}
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  )
}
