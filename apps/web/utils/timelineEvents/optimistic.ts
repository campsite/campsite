import { QueryClient } from '@tanstack/react-query'
import { CookieValueTypes } from 'cookies-next'
import { v4 as uuid } from 'uuid'

import { OrganizationMember, TimelineEvent, TimelineEventPage } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'
import {
  TimelineEventPostResolved,
  TimelineEventPostUnresolved,
  TimelineEventSubjectPinned,
  TimelineEventSubjectTitleUpdated,
  TimelineEventSubjectUnpinned
} from '@/utils/timelineEvents/types'

const OPTIMISTIC_ID_PREFIX = 'temp'
const ROLLUP_WINDOW = 60 * 1_000 // 60 seconds

const getPostsTimelineEvents = apiClient.organizations.getPostsTimelineEvents()

export function useOptimisticTimelineEventMemberActor() {
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const { data: member } = useGetOrganizationMember({
    username: currentUser?.username ?? '',
    org: `${scope}`,
    enabled: !!currentUser
  })

  return { member }
}

export function createOptimisticTimelineEvent(
  props:
    | {
        action: 'subject_title_updated'
        member: OrganizationMember
        subject_updated_from_title: string | null
        subject_updated_to_title: string | null
      }
    | {
        action: 'post_resolved'
        member: OrganizationMember
      }
    | {
        action: 'post_unresolved'
        member: OrganizationMember
      }
    | {
        action: 'subject_pinned'
        member: OrganizationMember
      }
    | {
        action: 'subject_unpinned'
        member: OrganizationMember
      }
): TimelineEvent | undefined {
  switch (props.action) {
    case 'subject_title_updated':
      return {
        id: `${OPTIMISTIC_ID_PREFIX}-${uuid()}`,
        action: props.action,
        member_actor: props.member,
        created_at: new Date().toISOString(),
        subject_updated_from_project: null,
        subject_updated_to_project: null,
        subject_updated_from_title: props.subject_updated_from_title,
        subject_updated_to_title: props.subject_updated_to_title,
        external_reference: null,
        post_reference: null,
        comment_reference: null,
        comment_reference_subject_type: null,
        comment_reference_subject_title: null,
        note_reference: null
      } satisfies TimelineEventSubjectTitleUpdated
    case 'post_resolved':
      return {
        id: `${OPTIMISTIC_ID_PREFIX}-${uuid()}`,
        action: props.action,
        member_actor: props.member,
        created_at: new Date().toISOString(),
        subject_updated_from_project: null,
        subject_updated_to_project: null,
        subject_updated_from_title: null,
        subject_updated_to_title: null,
        external_reference: null,
        post_reference: null,
        comment_reference: null,
        comment_reference_subject_type: null,
        comment_reference_subject_title: null,
        note_reference: null
      } satisfies TimelineEventPostResolved
    case 'post_unresolved':
      return {
        id: `${OPTIMISTIC_ID_PREFIX}-${uuid()}`,
        action: props.action,
        member_actor: props.member,
        created_at: new Date().toISOString(),
        subject_updated_from_project: null,
        subject_updated_to_project: null,
        subject_updated_from_title: null,
        subject_updated_to_title: null,
        external_reference: null,
        post_reference: null,
        comment_reference: null,
        comment_reference_subject_type: null,
        comment_reference_subject_title: null,
        note_reference: null
      } satisfies TimelineEventPostUnresolved
    case 'subject_pinned':
      return {
        id: `${OPTIMISTIC_ID_PREFIX}-${uuid()}`,
        action: props.action,
        member_actor: props.member,
        created_at: new Date().toISOString(),
        subject_updated_from_project: null,
        subject_updated_to_project: null,
        subject_updated_from_title: null,
        subject_updated_to_title: null,
        external_reference: null,
        post_reference: null,
        comment_reference: null,
        comment_reference_subject_type: null,
        comment_reference_subject_title: null,
        note_reference: null
      } satisfies TimelineEventSubjectPinned
    case 'subject_unpinned':
      return {
        id: `${OPTIMISTIC_ID_PREFIX}-${uuid()}`,
        action: props.action,
        member_actor: props.member,
        created_at: new Date().toISOString(),
        subject_updated_from_project: null,
        subject_updated_to_project: null,
        subject_updated_from_title: null,
        subject_updated_to_title: null,
        external_reference: null,
        post_reference: null,
        comment_reference: null,
        comment_reference_subject_type: null,
        comment_reference_subject_title: null,
        note_reference: null
      } satisfies TimelineEventSubjectUnpinned
    default:
      return undefined
  }
}

function rollUpTimelineEvents({
  optimisticTimelineEvent,
  pages
}: {
  optimisticTimelineEvent: TimelineEvent
  pages: TimelineEventPage[]
}) {
  const last_matching_timeline_event = pages
    .map((page) => page.data)
    .flat()
    .filter((timelineEvent) => {
      if (
        new Date(optimisticTimelineEvent.created_at).getTime() - new Date(timelineEvent.created_at).getTime() >=
        ROLLUP_WINDOW
      ) {
        return false
      }
      if (timelineEvent.member_actor?.id !== optimisticTimelineEvent.member_actor?.id) return false

      switch (optimisticTimelineEvent.action) {
        case 'subject_title_updated':
          return timelineEvent.action === 'subject_title_updated'
        case 'post_resolved':
          return timelineEvent.action === 'post_unresolved'
        case 'post_unresolved':
          return timelineEvent.action === 'post_resolved'
        case 'subject_pinned':
          return timelineEvent.action === 'subject_unpinned'
        case 'subject_unpinned':
          return timelineEvent.action === 'subject_pinned'
        default:
          return false
      }
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  if (!last_matching_timeline_event) {
    return pages.map((page, pageIndex) => ({
      ...page,
      data: page.data.concat(pageIndex === pages.length - 1 ? [optimisticTimelineEvent] : [])
    }))
  }

  const rolledUpTimelineEvent = ((): TimelineEvent | undefined => {
    switch (optimisticTimelineEvent.action) {
      case 'subject_title_updated':
        return {
          ...optimisticTimelineEvent,
          subject_updated_from_title: last_matching_timeline_event.subject_updated_from_title,
          created_at: last_matching_timeline_event.created_at
        }

      case 'post_resolved':
      case 'post_unresolved':
      case 'subject_pinned':
      case 'subject_unpinned':
        return undefined
      default:
        return optimisticTimelineEvent
    }
  })()

  return pages.map((page, pageIndex) => ({
    ...page,
    data: page.data
      .filter((timelineEvent) => timelineEvent.id !== last_matching_timeline_event.id)
      .concat(pageIndex === pages.length - 1 && rolledUpTimelineEvent ? [rolledUpTimelineEvent] : [])
  }))
}

export function insertPostTimelineEvent({
  queryClient,
  scope,
  postId,
  timelineEvent
}: {
  queryClient: QueryClient
  scope: CookieValueTypes
  postId: string
  timelineEvent?: TimelineEvent
}) {
  if (!timelineEvent) return

  setTypedInfiniteQueriesData(
    queryClient,
    getPostsTimelineEvents.requestKey({ orgSlug: `${scope}`, postId }),
    (old) => {
      if (!old) return old

      return {
        ...old,
        pages: rollUpTimelineEvents({ optimisticTimelineEvent: timelineEvent, pages: old.pages })
      }
    }
  )
}

export function isDateWithinRollupWindow(date: string) {
  return new Date().getTime() - new Date(date).getTime() < ROLLUP_WINDOW
}
