import { useState } from 'react'
import { CookieValueTypes } from 'cookies-next'
import { useAtom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { Button } from '@campsite/ui/Button'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { CheckIcon, ChevronDownIcon, GridIcon, ListIcon, SwitchIcon } from '@campsite/ui/Icons'
import { buildMenuItems } from '@campsite/ui/Menu'

import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useUpdatePreference } from '@/hooks/useUpdatePreference'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'

export type NoteIndexFilterType = 'for-me' | 'created' | 'all'

export const filterAtom = atomFamily((scope: CookieValueTypes) =>
  atomWithWebStorage<NoteIndexFilterType>(`${scope}:notes-index-filter`, 'for-me')
)

type NoteIndexSortType = 'last_activity_at' | 'created_at'

export const sortAtom = atomFamily(
  ({ scope, filter }: { scope: CookieValueTypes; filter: string }) =>
    atomWithWebStorage<NoteIndexSortType>(`${scope}:notes-index-sort:${filter}`, 'last_activity_at'),
  (a, b) => a.scope === b.scope && a.filter === b.filter
)

export function NotesIndexDisplayDropdown({ iconOnly = false }: { iconOnly?: boolean }) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const { scope } = useScope()
  const filter = useAtomValue(filterAtom(scope))
  const [sort, setSort] = useAtom(sortAtom({ scope, filter }))
  const updatePreference = useUpdatePreference()
  const layout = useGetCurrentUser().data?.preferences?.notes_layout
  const shortcut = 'shift+v'

  const items = buildMenuItems([
    {
      type: 'heading',
      label: 'Display density'
    },
    {
      type: 'item',
      leftSlot: <ListIcon />,
      rightSlot: layout === 'list' ? <CheckIcon /> : null,
      label: 'List',
      onSelect: () => updatePreference.mutate({ preference: 'notes_layout', value: 'list' })
    },
    {
      type: 'item',
      leftSlot: <GridIcon />,
      rightSlot: !layout || layout === 'grid' ? <CheckIcon /> : null,
      label: 'Grid',
      onSelect: () => updatePreference.mutate({ preference: 'notes_layout', value: 'grid' })
    },
    { type: 'separator' },
    {
      type: 'heading',
      label: 'Ordering'
    },
    {
      type: 'item',
      rightSlot: sort === 'last_activity_at' ? <CheckIcon /> : null,
      label: 'Recent activity',
      onSelect: () => setSort('last_activity_at')
    },
    {
      type: 'item',
      rightSlot: sort === 'created_at' ? <CheckIcon /> : null,
      label: 'Created',
      onSelect: () => setSort('created_at')
    }
  ])

  return (
    <>
      <LayeredHotkeys keys={shortcut} callback={() => setDropdownIsOpen(true)} />

      <DropdownMenu
        open={dropdownIsOpen}
        onOpenChange={setDropdownIsOpen}
        items={items}
        align='end'
        trigger={
          <Button
            variant='plain'
            leftSlot={iconOnly ? undefined : <ChevronDownIcon />}
            iconOnly={iconOnly ? <SwitchIcon /> : undefined}
            accessibilityLabel='Display dropdown'
            size='sm'
            tooltip='Display and sort'
            tooltipShortcut={shortcut}
          >
            {iconOnly ? null : 'Display'}
          </Button>
        }
      />
    </>
  )
}
