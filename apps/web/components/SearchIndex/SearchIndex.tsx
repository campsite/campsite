import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { useAtomValue, useSetAtom } from 'jotai'
import Router, { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

import { SearchCall, SearchMixedItem, SearchNote, SearchPost } from '@campsite/types'
import {
  Button,
  CloseIcon,
  LayeredHotkeys,
  LazyLoadingSpinner,
  NoteFilledIcon,
  SearchIcon,
  UIText,
  VideoCameraFilledIcon
} from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { EmptyState } from '@/components/EmptyState'
import { HTMLRenderer } from '@/components/HTMLRenderer'
import { IndexPageContainer, IndexPageContent } from '@/components/IndexPages/components'
import { PeopleIndexMemberRow } from '@/components/People/PeopleIndexMemberRow'
import { ProjectTag } from '@/components/ProjectTag'
import { SearchHighlights } from '@/components/SearchIndex/SearchHighlights'
import { SearchResult } from '@/components/SearchIndex/SearchResult'
import { SearchResultPostItem } from '@/components/SearchIndex/SearchResultPostItem'
import { BreadcrumbTitlebar, BreadcrumbTitlebarContainer } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { SelectGroupItemFn, useGroupedListNavigation } from '@/hooks/useListNavigation'
import { useSearchMixed } from '@/hooks/useSearchMixed'
import { useSearchOrganizationMembers } from '@/hooks/useSearchOrganizationMembers'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

import { addRecentSearchAtom, RecentSearches, recentSearchesAtom } from './RecentSearches'

export function SearchIndex() {
  const router = useRouter()
  const query = (router.query.q as string | undefined) || ''
  const focus = (router.query.f as string | undefined) || ''
  const { scope } = useScope()
  const addRecentSearch = useSetAtom(addRecentSearchAtom)

  const getSearch = useSearchMixed({ query, focus })
  const getOrganizationMembers = useSearchOrganizationMembers({
    query: query,
    enabled: !focus || focus === 'people'
  })
  const members = useMemo(() => flattenInfiniteData(getOrganizationMembers.data), [getOrganizationMembers.data])
  const recentSearches = useAtomValue(recentSearchesAtom(`${scope}`))

  const showRecent = !query
  const showPeople = !!members?.length && (!focus || focus === 'people')

  const { selectItem, resetActiveItem } = useGroupedListNavigation({
    groups: {
      recent: showRecent ? recentSearches.map((query) => ({ id: query })) : [],
      people: showPeople && members ? members : [],
      content: getSearch.data?.items ?? []
    },
    getItemDOMId: getItemRowDOMId
  })

  const hasMemberOrContentResults = getSearch.data?.items.length || members?.length
  const isLoading = getSearch.isLoading || getOrganizationMembers.isLoading
  const isFetching = getSearch.isFetching || getOrganizationMembers.isFetching

  useEffect(() => {
    addRecentSearch({ scope: `${scope}`, search: query })
  }, [addRecentSearch, query, scope])

  useEffect(() => {
    resetActiveItem()
  }, [resetActiveItem, query])

  const isPeopleFocusWithoutResults = focus === 'people' && !members?.length
  const isOtherFocusWithoutResults = focus && !getSearch.data?.items.length
  const isNoFocusWithoutAnyResults = !focus && !hasMemberOrContentResults
  const showEmptyState =
    !isLoading && !!query && (isPeopleFocusWithoutResults || isOtherFocusWithoutResults || isNoFocusWithoutAnyResults)

  return (
    <IndexPageContainer>
      <BreadcrumbTitlebar>
        <SearchField key={query} query={query} isLoading={isFetching} />
      </BreadcrumbTitlebar>

      <BreadcrumbTitlebarContainer className='h-auto gap-0.5 py-1.5'>
        <FilterButton>Everything</FilterButton>
        <FilterButton focus='posts'>Posts</FilterButton>
        <FilterButton focus='calls'>Calls</FilterButton>
        <FilterButton focus='notes'>Docs</FilterButton>
        <FilterButton focus='people'>People</FilterButton>
      </BreadcrumbTitlebarContainer>

      <IndexPageContent>
        {!isLoading && (
          <>
            {showRecent && (
              <RecentSearches
                recentSearches={recentSearches}
                onFocus={(index) => selectItem({ itemIndex: index, groupIndex: 0 })}
                onPointerMove={(index) => selectItem({ itemIndex: index, scroll: false, groupIndex: 0 })}
              />
            )}

            {showEmptyState && (
              <EmptyState
                message='Nothing found'
                icon={<SearchIcon size={72} className='text-quaternary opacity-50' />}
              />
            )}

            {showPeople && (
              <div className='flex flex-col'>
                {(!focus || !query) && (
                  <div className='flex items-center gap-4 py-2'>
                    <UIText weight='font-medium' tertiary>
                      People
                    </UIText>
                    <div className='flex-1 border-b' />
                  </div>
                )}
                <ul className='@container -mx-2 flex flex-col gap-px py-2'>
                  {members.map((member, index) => (
                    <PeopleIndexMemberRow
                      id={getItemRowDOMId({ id: member.id })}
                      member={member}
                      key={member.id}
                      onFocus={() => selectItem({ itemIndex: index, groupIndex: 1 })}
                      onPointerMove={() => selectItem({ itemIndex: index, scroll: false, groupIndex: 1 })}
                    />
                  ))}
                </ul>
              </div>
            )}

            {!!getSearch.data?.items.length && focus !== 'people' && (
              <div>
                {showPeople && (
                  <div className='flex items-center gap-4 py-2'>
                    <UIText weight='font-medium' tertiary>
                      Top results
                    </UIText>
                    <div className='flex-1 border-b' />
                  </div>
                )}
                <SearchResultsList
                  items={getSearch.data.items}
                  callMap={getSearch.data.callsMap}
                  postMap={getSearch.data.postsMap}
                  noteMap={getSearch.data.notesMap}
                  selectItem={selectItem}
                />
              </div>
            )}
          </>
        )}
      </IndexPageContent>
    </IndexPageContainer>
  )
}

interface SearchFieldProps {
  query: string
  isLoading: boolean
  mobile?: boolean
}

export function SearchField({ query, isLoading, mobile }: SearchFieldProps) {
  const { scope } = useScope()
  const [text, setText] = useState(query || '')
  const ref = useRef<HTMLInputElement>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { q, ...rest } = Router.query

    Router.push({ query: { ...rest, q: text } }, undefined, { shallow: true })

    ref.current?.blur()
  }

  return (
    <>
      <LayeredHotkeys keys={['/', 'meta+f']} callback={() => ref.current?.focus()} options={{ preventDefault: true }} />

      <form
        onSubmit={onSubmit}
        onKeyDownCapture={(e) => {
          // on mobile, if you try to blur the input when hitting the return key, the form won't fire — we have to do it manually
          if (e?.key === 'Enter' && isMobile) {
            ref.current?.blur()
            onSubmit(e)
          }
        }}
        className='no-drag flex w-full items-center gap-2'
      >
        <div
          className={cn('relative flex flex-1 items-center gap-2', {
            'bg-quaternary focus:bg-primary h-10 rounded-full border-transparent pl-2 pr-10': mobile
          })}
        >
          <span className='text-tertiary flex h-5 w-5 items-center justify-center'>
            {isLoading ? <LazyLoadingSpinner fallback={<SearchIcon />} /> : <SearchIcon />}
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
            autoFocus={!query}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e?.key === 'Escape') {
                if (text) return setText('')
                if (!text) return ref.current?.blur()
              }
            }}
          />
          <Button
            round
            iconOnly={<CloseIcon size={16} strokeWidth='2' />}
            onClick={() => {
              setText('')
              ref.current?.focus()
            }}
            href={`/${scope}/search`}
            onMouseDown={(e) => e.preventDefault()}
            accessibilityLabel='Clear search'
            variant='plain'
            className={cn('absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2', {
              'pointer-events-none opacity-0': isLoading || !text.length
            })}
          />
        </div>
      </form>
    </>
  )
}

export function FilterButton({
  focus,
  children,
  fullWidth
}: PropsWithChildren & { focus?: string; fullWidth?: boolean }) {
  const router = useRouter()
  const { f, ...query } = router.query
  const isFocused = f === focus

  return (
    <Button
      size={fullWidth ? 'base' : 'sm'}
      onClick={() => router.replace({ query: focus ? { ...query, f: focus } : query }, undefined, { shallow: true })}
      variant={isFocused ? 'flat' : 'plain'}
      fullWidth={fullWidth}
    >
      {children}
    </Button>
  )
}

export const getItemRowDOMId = (item: { id: string }) => `search-item-${item.id}`

function SearchResultsList({
  items,
  callMap,
  postMap,
  noteMap,
  selectItem
}: {
  items: SearchMixedItem[]
  callMap: Map<string, SearchCall>
  postMap: Map<string, SearchPost>
  noteMap: Map<string, SearchNote>
  selectItem: SelectGroupItemFn
}) {
  return (
    <ul className='@container -mx-2 flex flex-col gap-px py-2'>
      {items.map((item, index) => (
        <SearchResultItem
          key={item.id}
          item={item}
          callMap={callMap}
          postMap={postMap}
          noteMap={noteMap}
          onFocus={() => selectItem({ itemIndex: index, groupIndex: 2 })}
          onPointerMove={() => selectItem({ itemIndex: index, scroll: false, groupIndex: 2 })}
        />
      ))}
    </ul>
  )
}

interface InteractionProps {
  onFocus: () => void
  onPointerMove: () => void
}

interface HighlightProps {
  highlights: SearchMixedItem['highlights']
  titleHighlight: SearchMixedItem['title_highlight']
}

export type ItemProps = InteractionProps & HighlightProps

type SearchResultProps = InteractionProps & {
  item: SearchMixedItem
  callMap: Map<string, SearchCall>
  postMap: Map<string, SearchPost>
  noteMap: Map<string, SearchNote>
}

function SearchResultItem({ item, callMap, postMap, noteMap, onFocus, onPointerMove }: SearchResultProps) {
  const shared = {
    id: item.id,
    onFocus,
    onPointerMove,
    highlights: item.highlights,
    titleHighlight: item.title_highlight
  }

  switch (item.type) {
    case 'call':
      return <CallItem call={callMap.get(item.id)!} {...shared} />
    case 'note':
      return <NoteItem note={noteMap.get(item.id)!} {...shared} />
    case 'post':
      return <SearchResultPostItem post={postMap.get(item.id)!} {...shared} />
    default:
      return null
  }
}

function CallItem({ call, highlights, titleHighlight, ...rest }: ItemProps & { call: SearchCall }) {
  const { scope } = useScope()

  return (
    <SearchResult
      href={`/${scope}/calls/${call.id}`}
      id={call.id}
      className={!highlights?.length ? 'items-center' : 'items-start'}
      {...rest}
    >
      <VideoCameraFilledIcon className='text-green-500' size={24} />
      <div className='flex flex-col gap-0.5'>
        <div className='flex items-center'>
          <UIText primary weight='font-medium' className='break-anywhere mr-2 line-clamp-1'>
            <HTMLRenderer text={titleHighlight || call.title || 'Untitled call'} />
          </UIText>
          <UIText quaternary className='break-anywhere line-clamp-1'>
            {format(call.created_at, 'MMM d, yyyy')}
          </UIText>
        </div>

        <SearchHighlights highlights={highlights} />
      </div>
    </SearchResult>
  )
}

function NoteItem({ note, highlights, titleHighlight, ...rest }: ItemProps & { note: SearchNote }) {
  const { scope } = useScope()

  return (
    <SearchResult
      className={!highlights?.length ? 'items-center' : 'items-start'}
      href={`/${scope}/notes/${note.id}`}
      id={note.id}
      {...rest}
    >
      <NoteFilledIcon className='text-blue-500' size={24} />

      <div className='flex flex-1 items-center gap-3'>
        <div className='flex flex-1 flex-col gap-0.5'>
          <div className='flex items-center'>
            <UIText primary weight='font-medium' className='break-anywhere mr-2 line-clamp-1'>
              <HTMLRenderer text={titleHighlight || note.title || 'Untitled doc'} />
            </UIText>
            <UIText quaternary className='break-anywhere line-clamp-1'>
              {format(note.created_at, 'MMM d, yyyy')}
            </UIText>
          </div>

          <SearchHighlights highlights={highlights} />
        </div>
        {note.project && (
          <div className='hidden items-center gap-1 self-start pt-0.5 md:flex'>
            {note.project && <ProjectTag tabIndex={-1} project={note.project} />}
          </div>
        )}
      </div>
    </SearchResult>
  )
}
