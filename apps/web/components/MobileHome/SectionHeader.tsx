import { PropsWithChildren } from 'react'

import { ChevronRightIcon, cn, UIText } from '@campsite/ui'

type Props = PropsWithChildren & {
  label: string
  onClick?: () => void
  collapsed?: boolean
}

export function SectionHeader({ label, children, onClick, collapsed = false }: Props) {
  const Element = onClick ? 'button' : 'div'

  return (
    <div className='flex items-center justify-between gap-3 px-4'>
      {onClick && (
        <button onClick={onClick}>
          <ChevronRightIcon
            className={cn('text-quaternary flex-none transition-transform', {
              'rotate-90': !collapsed,
              'rotate-0': collapsed
            })}
            size={24}
          />
        </button>
      )}
      <Element onClick={onClick} className='flex-1 py-2 text-left'>
        <UIText weight='font-medium' tertiary>
          {label}
        </UIText>
      </Element>

      {children}
    </div>
  )
}
