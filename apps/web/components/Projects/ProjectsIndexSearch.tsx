import { useRef } from 'react'
import { useAtom } from 'jotai'

import { Button, CloseIcon, LayeredHotkeys, SearchIcon, TextField } from '@campsite/ui'

import { PROJECTS_LIST_NAVIGATION_CONTAINER_ID, searchAtom } from '@/components/Projects/ProjectsIndex'
import { BreadcrumbTitlebarContainer } from '@/components/Titlebar/BreadcrumbTitlebar'

export function ProjectsIndexSearch() {
  const [query, setQuery] = useAtom(searchAtom)
  const textFieldRef = useRef<HTMLInputElement>(null)

  function handleKeyDownCapture(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      textFieldRef.current?.blur()
    }

    if (event.key === 'Enter') {
      textFieldRef.current?.blur()
    }

    if (event.key === 'ArrowDown') {
      textFieldRef.current?.blur()

      // find the ul with the id search-results
      // find the first list item, then the first link within that list item
      // and focus on it
      const searchResults = document.getElementById(PROJECTS_LIST_NAVIGATION_CONTAINER_ID)
      const firstLink = searchResults?.querySelector('li')?.querySelector('a')

      firstLink?.focus()
    }
  }

  return (
    <>
      <LayeredHotkeys
        keys='mod+f'
        callback={() => {
          textFieldRef.current?.focus()
          textFieldRef.current?.setSelectionRange(0, textFieldRef.current.value.length)
        }}
        options={{ preventDefault: true, enableOnFormTags: true }}
      />

      <BreadcrumbTitlebarContainer className='relative flex h-auto py-1.5'>
        <SearchIcon className='text-quaternary -mr-1.5' />

        <div className='flex w-full flex-col'>
          <TextField
            ref={textFieldRef}
            value={query}
            onChange={setQuery}
            placeholder='Search...'
            additionalClasses='border-0 -translate-y-px bg-transparent dark:bg-transparent focus:ring-0 dark:focus:ring-0 dark:focus:border-0 outline-0 ring-0 p-0 pr-12'
            onKeyDownCapture={handleKeyDownCapture}
          />

          {!!query && (
            <Button
              className='absolute right-3 top-1/2 -translate-y-1/2'
              variant='flat'
              iconOnly={<CloseIcon size={16} strokeWidth='2' />}
              size='sm'
              accessibilityLabel='Clear search'
              onClick={() => setQuery('')}
            />
          )}
        </div>
      </BreadcrumbTitlebarContainer>
    </>
  )
}
