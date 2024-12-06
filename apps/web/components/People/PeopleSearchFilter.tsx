import { useRef } from 'react'
import { useAtom, useAtomValue } from 'jotai'

import { Button, CloseIcon, LayeredHotkeys, SearchIcon, Select, TextField } from '@campsite/ui'

import { PEOPLE_LIST_NAVIGATION_CONTAINER_ID } from '@/components/People/PeopleList'
import { BreadcrumbTitlebarContainer } from '@/components/Titlebar/BreadcrumbTitlebar'

import { roleFilterAtom, RoleType, rootFilterAtom, searchAtom } from './PeopleIndex'

export function PeopleSearchFilter() {
  const [query, setQuery] = useAtom(searchAtom)
  const [roleFilter, setRoleFilter] = useAtom(roleFilterAtom)
  const rootFilter = useAtomValue(rootFilterAtom)
  const textFieldRef = useRef<HTMLInputElement>(null)

  const canSearchOrFilter = rootFilter === 'active'

  const roleFilterOptions = [
    { value: 'none', label: 'All roles' },
    { value: 'admin', label: 'Admins' },
    { value: 'member', label: 'Members' },
    { value: 'viewer', label: 'Viewers' },
    { value: 'guest', label: 'Guests' }
  ]

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
      const searchResults = document.getElementById(PEOPLE_LIST_NAVIGATION_CONTAINER_ID)
      const firstLink = searchResults?.querySelector('li')?.querySelector('a')

      firstLink?.focus()
    }
  }

  if (!canSearchOrFilter) return null

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
        <Select
          size='sm'
          placeholder='Filter role'
          align='start'
          options={roleFilterOptions}
          value={roleFilter ? roleFilter : 'none'}
          onChange={(role) => {
            if (role === 'none') return setRoleFilter(undefined)
            setRoleFilter(role as RoleType)
          }}
          popoverWidth={140}
        />

        <div className='h-4 w-px border-l' />

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
