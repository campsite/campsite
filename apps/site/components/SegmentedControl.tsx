import { useEffect, useRef } from 'react'

import { cn } from '@campsite/ui'

const UL_STYLE = 'flex flex-row flex-nowrap'
const BUTTONS_GAP = 1 // px
const BUTTON_STYLE =
  'px-3.5 relative isolate flex leading-normal h-8 items-center justify-center rounded-full py-3 text-[13.01px] font-medium transition-colors duration-200 ease-in-out'
const DEBUG = false

interface Option {
  label: string
  value: string
}

interface Props {
  activePage: string
  setActivePage: (val: string) => void
  options: Option[]
}

export function SegmentedControl({ activePage, setActivePage, options }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const containerElement = containerRef.current
    const activeItemElement = activeItemRef.current

    if (containerElement && activeItemElement) {
      const { offsetLeft, offsetWidth } = activeItemElement

      const clipLeft = offsetLeft
      const clipRight = offsetLeft + offsetWidth - BUTTONS_GAP / 2

      containerElement.style.clipPath = `inset(0 ${Number(100 - (clipRight / containerElement.offsetWidth) * 100).toFixed(3)}% 0 ${Number((clipLeft / containerElement.offsetWidth) * 100).toFixed(3)}% round 20px)`
    }
  }, [activePage])

  return (
    <div className='rounded-full bg-black/5 p-1 dark:bg-white/10'>
      <div className='relative isolate'>
        <ul className={UL_STYLE} style={{ gap: `${BUTTONS_GAP}px` }}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                ref={option.value === activePage ? activeItemRef : null}
                onClick={() => setActivePage(option.value)}
                className={cn(BUTTON_STYLE, 'hover:bg-black/[0.06] dark:hover:bg-white/[0.08]', DEBUG && '!bg-red-500')}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>

        <div
          aria-hidden
          ref={containerRef}
          className={cn('absolute inset-0 z-10 overflow-hidden', 'ease transition-[clip-path] duration-[250ms]')}
        >
          <ul
            className={cn(
              UL_STYLE,
              'bg-gray-800 text-gray-50 dark:bg-gray-200 dark:text-gray-900',
              DEBUG && '!bg-gray-800/20'
            )}
            style={{ gap: `${BUTTONS_GAP}px` }}
          >
            {options.map((option) => (
              <li key={option.value}>
                <button tabIndex={-1} onClick={() => setActivePage(option.value)} className={BUTTON_STYLE}>
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
