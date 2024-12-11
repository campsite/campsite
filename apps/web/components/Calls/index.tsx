import { memo, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { useDebounce } from 'use-debounce'

import { Call, CallPage, Project } from '@campsite/types'
import {
  Command,
  HighlightedCommandItem,
  Link,
  LoadingSpinner,
  Tooltip,
  UIText,
  useCommand,
  VideoCameraFilledIcon,
  VideoCameraIcon
} from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

import { CallOverflowMenu } from '@/components/Calls/CallOverflowMenu'
import { callsFilterAtom, CallsIndexFilter } from '@/components/Calls/CallsIndexFilter'
import { MobileCallsTitlebar } from '@/components/Calls/MobileCallsTitlebar'
import { NewCallButton } from '@/components/Calls/NewCallButton'
import { useGetCallPeerMembers } from '@/components/Calls/useGetCallPeerUsers'
import { EmptySearchResults } from '@/components/Feed/EmptySearchResults'
import { FloatingNewCallButton } from '@/components/FloatingButtons/NewCall'
import { HTMLRenderer } from '@/components/HTMLRenderer'
import {
  IndexPageContainer,
  IndexPageContent,
  IndexPageEmptyState,
  IndexPageLoading,
  IndexSearchInput
} from '@/components/IndexPages/components'
import { InfiniteLoader } from '@/components/InfiniteLoader'
import { RefetchingPageIndicator } from '@/components/NavigationBar/RefetchingPageIndicator'
import { refetchingCallsAtom } from '@/components/NavigationBar/useNavigationTabAction'
import { useHandleCommandListSubjectSelect } from '@/components/Projects/hooks/useHandleHighlightedItemSelect'
import { ProjectCallButton } from '@/components/Projects/ProjectCallButton'
import { ProjectTag } from '@/components/ProjectTag'
import { SplitViewContainer, SplitViewDetail } from '@/components/SplitView'
import { SubjectCommand } from '@/components/Subject/SubjectCommand'
import { MultiUserAvatar } from '@/components/ThreadAvatar'
import { CallBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import {
  BreadcrumbLabel,
  BreadcrumbTitlebar,
  BreadcrumbTitlebarContainer
} from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useCallsSubscriptions } from '@/hooks/useCallsSubscriptions'
import { useGetCalls } from '@/hooks/useGetCalls'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { encodeCommandListSubject } from '@/utils/commandListSubject'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { getGroupDateHeading } from '@/utils/getGroupDateHeading'
import { groupByDate } from '@/utils/groupByDate'

export function CallsIndex() {
  const { scope } = useScope()
  const isRefetching = useAtomValue(refetchingCallsAtom)
  const isCommunity = useIsCommunity()
  const filter = useAtomValue(callsFilterAtom({ scope }))
  const [query, setQuery] = useState('')
  const [queryDebounced] = useDebounce(query, 150)
  const getCalls = useGetCalls({ enabled: !isCommunity, filter: filter, query: queryDebounced })

  const isSearching = queryDebounced.length > 0
  const isSearchLoading = queryDebounced.length > 0 && getCalls.isFetching

  if (isCommunity) return null

  return (
    <>
      <FloatingNewCallButton />

      <SplitViewContainer>
        <IndexPageContainer>
          <BreadcrumbTitlebar>
            <Link draggable={false} href={`/${scope}/calls`} className='flex items-center gap-3'>
              <CallBreadcrumbIcon />
              <BreadcrumbLabel>Calls</BreadcrumbLabel>
            </Link>
            <div className='ml-2 flex flex-1 items-center gap-0.5'>
              <CallsIndexFilter />
            </div>
            <NewCallButton />
          </BreadcrumbTitlebar>

          <MobileCallsTitlebar />

          <BreadcrumbTitlebarContainer className='h-10'>
            <IndexSearchInput query={query} setQuery={setQuery} isSearchLoading={isSearchLoading} />
          </BreadcrumbTitlebarContainer>

          <RefetchingPageIndicator isRefetching={isRefetching} />

          <IndexPageContent id='/[org]/calls'>
            <CallsContent getCalls={getCalls} isSearching={isSearching} />
          </IndexPageContent>
        </IndexPageContainer>

        <SplitViewDetail />
      </SplitViewContainer>
    </>
  )
}

interface CallsContentProps {
  getCalls: ReturnType<typeof useInfiniteQuery<CallPage>>
  isSearching: boolean
  project?: Project
}

export function CallsContent({ getCalls, isSearching, project }: CallsContentProps) {
  const calls = useMemo(() => flattenInfiniteData(getCalls.data) ?? [], [getCalls.data])

  return (
    <>
      <CallsList calls={calls} isSearching={isSearching} isLoading={getCalls.isLoading} project={project} />

      <InfiniteLoader
        hasNextPage={!!getCalls.hasNextPage}
        isError={!!getCalls.isError}
        isFetching={!!getCalls.isFetching}
        isFetchingNextPage={!!getCalls.isFetchingNextPage}
        fetchNextPage={getCalls.fetchNextPage}
      />
    </>
  )
}

function CallsList({
  calls,
  isSearching,
  isLoading,
  project
}: {
  calls: Call[]
  isSearching: boolean
  isLoading: boolean
  project?: Project
}) {
  useCallsSubscriptions()

  const hasCalls = calls.length > 0
  const needsCommandWrap = !useCommand()

  if (isLoading) {
    return <IndexPageLoading />
  }

  if (!hasCalls) {
    return isSearching ? <EmptySearchResults /> : <CallsIndexEmptyState project={project} />
  }

  return (
    <ConditionalWrap
      condition={needsCommandWrap}
      wrap={(children) => (
        <SubjectCommand>
          <Command.List
            className={cn('flex flex-1 flex-col', { 'gap-4 md:gap-6 lg:gap-8': !isSearching, 'gap-px': isSearching })}
          >
            {children}
          </Command.List>
        </SubjectCommand>
      )}
    >
      {isSearching ? (
        <SearchCallsIndexContent calls={calls} hideProject={!!project} />
      ) : (
        <GroupedCallsIndexContent calls={calls} hideProject={!!project} />
      )}
    </ConditionalWrap>
  )
}

function GroupedCallsIndexContent(props: { calls: Call[]; hideProject?: boolean }) {
  const callGroups = groupByDate(props.calls, (call) => call.created_at)

  return Object.entries(callGroups).map(([date, calls]) => {
    const dateHeading = getGroupDateHeading(date)

    return (
      <div key={date} className='flex flex-col'>
        <div className='flex items-center gap-4 py-2'>
          <UIText weight='font-medium' tertiary>
            {dateHeading}
          </UIText>
          <div className='flex-1 border-b' />
        </div>

        <ul className='flex flex-col gap-1 py-2'>
          {calls.map((call) => (
            <CallRow key={call.id} call={call} hideProject={props.hideProject} />
          ))}
        </ul>
      </div>
    )
  })
}

function SearchCallsIndexContent({ calls, hideProject }: { calls: Call[]; hideProject?: boolean }) {
  return calls.map((call) => <CallRow key={call.id} call={call} display='search' hideProject={hideProject} />)
}

function CallsIndexEmptyState({ project }: { project?: Project }) {
  const router = useRouter()
  const isProjectCalls = router.pathname === '/[org]/projects/[projectId]/calls'

  return (
    <IndexPageEmptyState>
      <VideoCameraIcon size={32} />
      <div className='flex flex-col gap-1'>
        <UIText size='text-base' weight='font-semibold'>
          Record your calls
        </UIText>
        <UIText size='text-base' tertiary className='text-balance'>
          Recorded calls are automatically transcribed and summarized to share with your team.
        </UIText>
      </div>

      {project?.message_thread_id && isProjectCalls ? (
        <ProjectCallButton project={project} variant='primary' />
      ) : (
        <NewCallButton alignMenu='center' />
      )}
    </IndexPageEmptyState>
  )
}

interface CallRowProps {
  call: Call
  display?: 'default' | 'search'
  hideProject?: boolean
}

export const CallRow = memo(({ call, display, hideProject = false }: CallRowProps) => {
  const { scope } = useScope()
  const callMembers = useGetCallPeerMembers({ peers: call.peers, excludeCurrentUser: true })
  const summary = call.summary_html
  const { handleSelect } = useHandleCommandListSubjectSelect()
  const href = `/${scope}/calls/${call.id}`

  return (
    <div className='relative flex items-center gap-3 px-3 py-2.5 pr-2'>
      <CallOverflowMenu type='context' call={call}>
        <HighlightedCommandItem
          className='absolute inset-0 z-0'
          value={encodeCommandListSubject(call, { href })}
          onSelect={handleSelect}
        />
      </CallOverflowMenu>

      {!!callMembers.length && <MultiUserAvatar members={callMembers} size='lg' showOnlineIndicator={false} />}
      {!callMembers.length && (
        <div className='bg-quaternary text-quaternary flex h-10 w-10 items-center justify-center rounded-full'>
          <VideoCameraFilledIcon />
        </div>
      )}

      <div className='flex flex-1 flex-col'>
        <div className='flex flex-1 flex-row items-center gap-3'>
          <UIText
            weight='font-medium'
            size='text-[15px]'
            className='line-clamp-1'
            tertiary={call.processing_generated_title}
          >
            {call.processing_generated_title ? 'Processing call...' : call.title || 'Untitled'}
          </UIText>
          <UIText size='text-[15px]' quaternary>
            {call.recordings_duration}
          </UIText>
          {display === 'search' && (
            <UIText size='text-[15px]' quaternary>
              {format(call.created_at, 'MMM d, yyyy')}
            </UIText>
          )}
          {call.processing_generated_summary && (
            <Tooltip label='Creating summary...'>
              <span className='opacity-50'>
                <LoadingSpinner />
              </span>
            </Tooltip>
          )}
        </div>

        {summary && (
          <HTMLRenderer
            className='text-tertiary break-anywhere line-clamp-1 max-w-xl select-text text-sm'
            text={summary}
          />
        )}
      </div>

      {call.project && !hideProject && <ProjectTag project={call.project} />}
    </div>
  )
})
CallRow.displayName = 'CallRow'

interface CompactCallRowProps {
  call: Call
  display?: 'default' | 'search' | 'pinned'
  hideProject?: boolean
}

export function CompactCallRow({ call, display }: CompactCallRowProps) {
  const { scope } = useScope()
  const { handleSelect } = useHandleCommandListSubjectSelect()

  const href = `/${scope}/calls/${call.id}`

  if (display === 'pinned') {
    return (
      <div className='relative flex items-center gap-3 px-3 py-2.5 pr-2'>
        <CallOverflowMenu type='context' call={call}>
          <HighlightedCommandItem
            className='absolute inset-0 z-0'
            value={encodeCommandListSubject(call, { href, pinned: true })}
            onSelect={handleSelect}
          />
        </CallOverflowMenu>

        <div className='flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-900/50'>
          <VideoCameraFilledIcon size={24} />
        </div>

        <div className='flex flex-1 flex-col'>
          <div className='flex flex-1 flex-row items-center gap-3'>
            <UIText
              weight='font-medium'
              size='text-[15px]'
              className='line-clamp-1'
              tertiary={call.processing_generated_title}
            >
              {call.processing_generated_title ? 'Processing call...' : call.title || 'Untitled'}
            </UIText>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative flex items-center gap-3 px-3 py-2.5 pr-2'>
      <CallOverflowMenu type='context' call={call}>
        <HighlightedCommandItem
          className='absolute inset-0 z-0'
          value={encodeCommandListSubject(call, { href })}
          onSelect={handleSelect}
        />
      </CallOverflowMenu>

      <VideoCameraIcon size={24} />

      <div className='flex flex-1 flex-col'>
        <div className='flex flex-1 flex-row items-center gap-3'>
          <UIText
            weight='font-medium'
            size='text-[15px]'
            className='line-clamp-1'
            tertiary={call.processing_generated_title}
          >
            {call.processing_generated_title ? 'Processing call...' : call.title || 'Untitled'}
          </UIText>
          {display === 'search' && (
            <UIText size='text-[15px]' quaternary>
              {format(call.created_at, 'MMM d, yyyy')}
            </UIText>
          )}
        </div>
      </div>

      {call.project && <ProjectTag project={call.project} />}
    </div>
  )
}
