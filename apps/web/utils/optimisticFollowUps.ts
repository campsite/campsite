import { InfiniteData, QueryClient } from '@tanstack/react-query'

import { FollowUp, NotificationPage, OrganizationsOrgSlugFollowUpsIdPutRequest } from '@campsite/types'

import { useQueryNormalizer } from './normy/QueryNormalizerProvider'
import { apiClient, setTypedInfiniteQueriesData } from './queryClient'
import { createNormalizedOptimisticUpdate, setNormalizedData } from './queryNormalization'

/* 
    we need to update follow ups across the follow up's subject 
    and any notifications tied to it when changed in a post, note, comment, or notifcation
*/

export function clearNotificationsWithFollowUp({
  id,
  type,
  queryClient
}: {
  id: string
  type: FollowUpType
  queryClient: QueryClient
}) {
  setTypedInfiniteQueriesData(queryClient, getMembersMeNotifications.baseKey, (old) => {
    if (!old) return
    return {
      ...old,
      pages: old.pages.map((page) => {
        return {
          ...page,
          data: page.data.filter(
            (notification) => notification.follow_up_subject?.id !== id && notification.follow_up_subject?.type !== type
          )
        }
      })
    }
  })
}

const getMembersMeNotifications = apiClient.organizations.getMembersMeNotifications()
const getMembersMeArchivedNotifications = apiClient.organizations.getMembersMeArchivedNotifications()
const getFollowUps = apiClient.organizations.getFollowUps()

interface PropsFollowUpInsert {
  queryClient: QueryClient
  queryNormalizer: ReturnType<typeof useQueryNormalizer>
  followUp: FollowUp
}

export function handleFollowUpInsert({ queryClient, queryNormalizer, followUp }: PropsFollowUpInsert) {
  const type = normyTypeFromApiTypeName(followUp.subject.type)

  function updateNotificationInfiniteData(old: InfiniteData<NotificationPage> | undefined) {
    if (!old) return
    return {
      ...old,
      pages: old.pages.map((page) => {
        return {
          ...page,
          data: page.data.map((notification) => {
            if (notification.follow_up_subject?.id === followUp.subject.id) {
              return {
                ...notification,
                follow_up_subject: {
                  ...notification.follow_up_subject,
                  viewer_follow_up: followUp
                }
              }
            }

            return notification
          })
        }
      })
    }
  }

  setTypedInfiniteQueriesData(queryClient, getMembersMeNotifications.baseKey, updateNotificationInfiniteData)
  setTypedInfiniteQueriesData(queryClient, getMembersMeArchivedNotifications.baseKey, updateNotificationInfiniteData)

  if (type)
    return setNormalizedData({
      queryNormalizer,
      type: type,
      id: followUp.subject.id,
      update: (old) => ({
        follow_ups: [...old.follow_ups, followUp]
      })
    })
}

interface PropsFollowUpDelete {
  queryClient: QueryClient
  queryNormalizer: ReturnType<typeof useQueryNormalizer>
  followUpId: string
  subjectId: string
  subjectType: string
}

export function handleFollowUpDelete({
  queryClient,
  queryNormalizer,
  followUpId,
  subjectId,
  subjectType
}: PropsFollowUpDelete) {
  const type = normyTypeFromApiTypeName(subjectType)

  function updateNotificationInfiniteData(old: InfiniteData<NotificationPage> | undefined) {
    if (!old) return
    return {
      ...old,
      pages: old.pages.map((page) => {
        return {
          ...page,
          data: page.data.map((notification) => {
            if (notification.follow_up_subject?.id === subjectId) {
              return {
                ...notification,
                follow_up_subject: {
                  ...notification.follow_up_subject,
                  viewer_follow_up: null
                }
              }
            }

            return notification
          })
        }
      })
    }
  }

  setTypedInfiniteQueriesData(queryClient, getMembersMeNotifications.baseKey, updateNotificationInfiniteData)
  setTypedInfiniteQueriesData(queryClient, getMembersMeArchivedNotifications.baseKey, updateNotificationInfiniteData)

  setTypedInfiniteQueriesData(queryClient, getFollowUps.baseKey, (old) => {
    if (!old) return
    return {
      ...old,
      pages: old.pages.map((page) => {
        return {
          ...page,
          data: page.data.filter((followUp) => followUp.id != followUpId)
        }
      })
    }
  })

  // remove the follow up from it's subject (post, note, comment, etc)
  if (type)
    return createNormalizedOptimisticUpdate({
      queryNormalizer,
      type: type,
      id: subjectId,
      update: (old) => ({ follow_ups: old.follow_ups.filter((fu) => fu.id != followUpId) })
    })
}

interface PropsFollowUpUpdate {
  queryNormalizer: ReturnType<typeof useQueryNormalizer>
  followUpId: string
  subjectId: string
  subjectType: string
  updateData: OrganizationsOrgSlugFollowUpsIdPutRequest
}

export function handleFollowUpUpdate({
  queryNormalizer,
  followUpId,
  subjectId,
  subjectType,
  updateData
}: PropsFollowUpUpdate) {
  const type = normyTypeFromApiTypeName(subjectType)

  if (type)
    return createNormalizedOptimisticUpdate({
      queryNormalizer,
      type: type,
      id: subjectId,
      update: (old) => ({
        follow_ups: old.follow_ups.map((fu) => (fu.id === followUpId ? { ...fu, ...updateData } : fu))
      })
    })
}

type FollowUpType = 'post' | 'note' | 'comment' | 'call'

// convert from `api_type_name` and `type_name` from server to Normy type
export function normyTypeFromApiTypeName(type: string): FollowUpType | undefined {
  switch (type) {
    case 'post':
    case 'Post':
      return 'post'
    case 'note':
    case 'Note':
      return 'note'
    case 'comment':
    case 'Comment':
      return 'comment'
    case 'call':
    case 'Call':
      return 'call'
    default:
      return undefined
  }
}
