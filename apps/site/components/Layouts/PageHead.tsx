import { UIText } from '@campsite/ui/src/Text'
import { cn } from '@campsite/ui/src/utils'

interface Props {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function PageHead({ title, subtitle, children }: Props) {
  return (
    <div className='flex flex-col gap-4 lg:items-center lg:text-center'>
      <PageTitle>{title}</PageTitle>

      {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}

      {children && <>{children}</>}
    </div>
  )
}

export function PageTitle({
  children,
  className,
  id,
  element = 'h1'
}: {
  children: React.ReactNode
  className?: string
  id?: string
  element?: string
}) {
  return (
    <UIText
      id={id}
      element={element}
      size='text-[clamp(2.4rem,_4vw,_4rem)]'
      className={cn('text-balance leading-[1.1] -tracking-[1px] lg:-tracking-[1.8px]', className, id && 'scroll-mt-20')}
      weight='font-semibold'
    >
      {children}
    </UIText>
  )
}

export function PageSubtitle({
  children,
  className,
  element = 'h2'
}: {
  children: React.ReactNode
  className?: string
  element?: string
}) {
  return (
    <UIText
      element={element}
      size='text-[clamp(1.1rem,_2vw,_1.4rem)]'
      className={cn(
        'max-w-5xl text-balance leading-relaxed -tracking-[0.1px] md:-tracking-[0.2px] lg:-tracking-[0.3px] xl:-tracking-[0.4px]',
        className
      )}
      weight='font-medium'
      secondary
    >
      {children}
    </UIText>
  )
}
