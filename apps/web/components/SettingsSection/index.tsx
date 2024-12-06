import { Button, ChevronDownIcon, Headline, Link, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

interface Props {
  id?: string
  children: React.ReactNode
  className?: string
}

export function Section({ className, ...rest }: Props) {
  return (
    <div
      className={cn(
        'bg-primary dark:bg-tertiary relative flex w-full scroll-m-4 flex-col rounded-lg border',
        className
      )}
      {...rest}
    />
  )
}

export function Header({ className, ...rest }: Props) {
  return <div className={cn('flex flex-wrap items-center justify-between gap-3 px-3 pt-3', className)} {...rest} />
}

export function Title(props: Props) {
  return <Headline element='div' {...props} />
}

export function Description({ className, ...rest }: Props) {
  return <UIText tertiary className={cn('mt-0.5 px-3 lg:max-w-2xl', className)} {...rest} />
}

interface SeparatorProps {
  className?: string
}

export function Separator({ className }: SeparatorProps) {
  return <div className={cn('bg-quaternary my-3 h-px w-full', className)} />
}

export function Body({ className = '', ...props }: Props) {
  return <div className={cn('px-3 pb-3', className)} {...props} />
}

export function Footer(props: Props) {
  return <div className='flex justify-end rounded-b-lg border-t p-3' {...props} />
}

interface SubTab {
  label: string
  active: boolean
  href?: string
  onClick?: () => void
}

interface SubTabsProps {
  tabs: SubTab[]
}

export function SubTabs(props: SubTabsProps) {
  const { tabs } = props

  return (
    <div className='border-b pt-2'>
      <nav className='flex'>
        {tabs.map((link) => {
          if (link.href) {
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={link.onClick}
                replace={true}
                scroll={false}
                className={cn(
                  'hover:text-primary initial:text-tertiary relative border-none p-3 text-sm transition before:absolute before:inset-x-4 before:bottom-0 before:block before:h-0.5 before:transition hover:before:bg-black/25 dark:hover:before:bg-white/20',
                  {
                    'text-primary before:!bg-black dark:before:!bg-white': link.active
                  }
                )}
              >
                {link.label}
              </Link>
            )
          } else {
            return (
              <button
                key={link.href}
                onClick={link.onClick}
                className={cn(
                  'hover:text-primary initial:text-tertiary relative border-none p-3 text-sm transition before:absolute before:inset-x-4 before:bottom-0 before:block before:h-0.5 before:transition hover:before:bg-black/25 dark:hover:before:bg-white/20',
                  {
                    'text-primary before:!bg-black dark:before:!bg-white': link.active
                  }
                )}
              >
                {link.label}
              </button>
            )
          }
        })}
      </nav>
    </div>
  )
}

interface SettingsTableFooterProps {
  resource: string
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  length: number | undefined
  total: number | undefined
}

export function SettingsTableFooter({
  resource,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  length,
  total
}: SettingsTableFooterProps) {
  if (!hasNextPage) return null

  return (
    <Footer>
      <div className='grid w-full grid-cols-3 items-center justify-between'>
        <UIText tertiary>{`Showing ${length} of ${total} ${resource}`}</UIText>
        <div className='flex justify-center'>
          <Button
            variant='plain'
            rightSlot={<ChevronDownIcon />}
            loading={isFetchingNextPage}
            disabled={!hasNextPage}
            onClick={fetchNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Show more'}
          </Button>
        </div>
        <span />
      </div>
    </Footer>
  )
}
