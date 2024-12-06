import { atom, useSetAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { ArrowUpLeftIcon, Button, CloseIcon, cn, Link, UIText } from '@campsite/ui'

import { getItemRowDOMId } from '@/components/SearchIndex'
import { useScope } from '@/contexts/scope'
import { useCanHover } from '@/hooks/useCanHover'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'

export const recentSearchesAtom = atomFamily((scope: string) =>
  atomWithWebStorage<string[]>(`search:recent:${scope}`, [])
)

export const addRecentSearchAtom = atom(null, (get, set, payload: { scope: string; search: string }) => {
  if (!payload.search) return

  const prev = get(recentSearchesAtom(payload.scope))
  const next = [payload.search, ...prev.filter((query) => query !== payload.search)].slice(0, 10)

  set(recentSearchesAtom(payload.scope), next)
})

export const removeRecentSearchAtom = atom(null, (get, set, payload: { scope: string; search: string }) => {
  const prev = get(recentSearchesAtom(payload.scope))
  const next = prev.filter((query) => query !== payload.search)

  set(recentSearchesAtom(payload.scope), next)
})

interface Props {
  recentSearches: string[]
  onFocus: (index: number) => void
  onPointerMove: (index: number) => void
}

export function RecentSearches({ recentSearches, onFocus, onPointerMove }: Props) {
  const { scope } = useScope()
  const setRecentSearches = useSetAtom(recentSearchesAtom(`${scope}`))
  const removeRecentSearch = useSetAtom(removeRecentSearchAtom)
  const canHover = useCanHover()

  if (recentSearches.length === 0) return null

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-4'>
        <UIText weight='font-medium' tertiary>
          Recent searches
        </UIText>
        <div className='flex-1 border-b' />
        <Button variant='plain' onClick={() => setRecentSearches([])}>
          Clear
        </Button>
      </div>

      <ul className='flex flex-col'>
        {recentSearches.map((query, index) => (
          <li
            key={query}
            className={cn('group relative -mx-2 rounded-md', {
              'focus-within:bg-tertiary': canHover
            })}
          >
            <Link
              id={getItemRowDOMId({ id: query })}
              onFocus={() => onFocus(index)}
              onPointerMove={() => onPointerMove(index)}
              className='flex w-full flex-1 items-center gap-3 px-3 py-2.5 text-left focus:ring-0'
              href={`/${scope}/search?q=${query}`}
              shallow
              replace
            >
              <span className='flex h-6 w-6 flex-none items-center justify-center'>
                <ArrowUpLeftIcon size={18} className='text-quaternary' />
              </span>
              <UIText className='break-anywhere line-clamp-1 flex-1'>{query}</UIText>
            </Link>
            <Button
              variant='plain'
              onClick={() => removeRecentSearch({ scope: `${scope}`, search: query })}
              className='text-tertiary hover:text-primary absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100'
              iconOnly={<CloseIcon strokeWidth='2' size={16} />}
              accessibilityLabel='Remove'
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
