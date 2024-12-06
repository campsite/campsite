import { memo, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useAtomValue } from 'jotai'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useDebounce } from 'use-debounce'

import { CAL_DOT_COM_APP_URL, GOOGLE_CALENDAR_ADD_ON_URL } from '@campsite/config'
import { Call, CallPage, Project } from '@campsite/types'
import {
  Button,
  CloseIcon,
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
import { useGetCalDotComIntegration } from '@/hooks/useGetCalDotComIntegration'
import { useGetCalls } from '@/hooks/useGetCalls'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetGoogleCalendarIntegration } from '@/hooks/useGetGoogleCalendarIntegration'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useUpdatePreference } from '@/hooks/useUpdatePreference'
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
            <CalendarIntegrationsUpsell />
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

export function CalendarIntegrationsUpsell() {
  const { data: googleCalendarIntegration } = useGetGoogleCalendarIntegration()
  const { data: calDotComIntegration } = useGetCalDotComIntegration()
  const { data: currentUser } = useGetCurrentUser()
  const { mutate: updateUserPreference } = useUpdatePreference()

  if (currentUser?.preferences?.feature_tip_calls_index_integrations === 'true') return null
  if (!googleCalendarIntegration || googleCalendarIntegration.installed) return null
  if (!calDotComIntegration || calDotComIntegration.installed) return null

  return (
    <div className='bg-tertiary flex flex-col items-start justify-between rounded-2xl'>
      <div className='flex w-full items-center gap-3 border-b p-4'>
        <CallBreadcrumbIcon />

        <UIText className='flex-1' weight='font-semibold'>
          Use Campsite calls in more places
        </UIText>
        <Button
          iconOnly={<CloseIcon strokeWidth='2' />}
          accessibilityLabel='Dismiss'
          round
          variant='plain'
          onClick={() => {
            updateUserPreference({
              preference: 'feature_tip_calls_index_integrations',
              value: 'true'
            })
          }}
        />
      </div>

      <div className='flex w-full flex-col gap-4 p-4'>
        {!calDotComIntegration?.installed && (
          <div className='flex items-center gap-3'>
            <Image
              src='/img/services/cal-dot-com.png'
              width='36'
              height='36'
              alt='Cal.com icon'
              className='rounded-md dark:ring-1 dark:ring-white/10'
            />
            <div className='flex-1'>
              <UIText weight='font-semibold'>Cal.com</UIText>
              <UIText secondary>Use Campsite calls for new bookings</UIText>
            </div>
            <Button href={CAL_DOT_COM_APP_URL} externalLink variant='primary'>
              Add to Cal.com
            </Button>
          </div>
        )}

        {!googleCalendarIntegration?.installed && (
          <div className='flex items-center gap-3'>
            <Image
              src='/img/services/google-calendar.png'
              width='36'
              height='36'
              alt='Google Calendar icon'
              className='rounded-md'
            />
            <div className='flex-1'>
              <UIText weight='font-semibold'>Google Calendar</UIText>
              <UIText secondary>Attach call links to calendar events in a single click</UIText>
            </div>
            <Button href={GOOGLE_CALENDAR_ADD_ON_URL} externalLink variant='primary'>
              Add to Google Calendar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
