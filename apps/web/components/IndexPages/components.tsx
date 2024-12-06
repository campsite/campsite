import { forwardRef, useRef } from 'react'

import { LayeredHotkeys, LazyLoadingSpinner, SearchIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { ScrollableContainer, ScrollableContainerProps } from '../ScrollableContainer'

export function IndexPageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('relative flex flex-1 flex-col overflow-hidden', className)}> {children} </div>
}

type Props = ScrollableContainerProps & {
  className?: string
}

export const IndexPageContent = forwardRef<HTMLDivElement, Props>(({ className, children, ...props }, ref) => {
  return (
    <ScrollableContainer className='scroll-p-2' {...props}>
      <div
        ref={ref}
        className={cn(
          'mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-4 focus-visible:outline-none md:gap-6 md:py-6 lg:gap-8 lg:px-6 lg:py-8',
          className
        )}
      >
        {children}
      </div>
    </ScrollableContainer>
  )
})

IndexPageContent.displayName = 'IndexPageContent'

export function IndexPageLoading() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center'>
      <LazyLoadingSpinner />
    </div>
  )
}

export function IndexPageEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className='mx-auto flex w-full max-w-lg flex-1 items-center justify-center'>
      <div className='flex flex-col items-center space-y-4 text-center'>{children}</div>
    </div>
  )
}

interface IndexSearchInputProps {
  query: string
  setQuery: (query: string) => void
  isSearchLoading: boolean
}

export function IndexSearchInput({ query, setQuery, isSearchLoading }: IndexSearchInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className='flex flex-1 flex-row items-center gap-2'>
      <LayeredHotkeys keys='meta+f' callback={() => ref.current?.focus()} options={{ preventDefault: true }} />

      <span className='text-tertiary flex h-5 w-5 items-center justify-center'>
        {isSearchLoading ? <LazyLoadingSpinner fallback={<SearchIcon />} /> : <SearchIcon />}
      </span>
      <input
        ref={ref}
        className='flex-1 border-none bg-transparent p-0 text-sm outline-none ring-0 focus:ring-0'
        placeholder='Search...'
        role='searchbox'
        autoComplete='off'
        autoCorrect='off'
        spellCheck={false}
        type='text'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setQuery('')
            ref.current?.blur()
          } else if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      />
    </div>
  )
}
