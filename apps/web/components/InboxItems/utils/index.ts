import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type { FollowUp, Notification } from '@campsite/types'

// ----------------------------------------------------------------------------

function isNotification(item: Notification | FollowUp): item is Notification {
  return 'reason' in item
}

// ----------------------------------------------------------------------------

const expandedNotificationGroupsAtom = atomWithStorage<Record<string, boolean>>(
  'campsite:inbox:expanded_notification_groups',
  {}
)

const setExpandedNotificationGroupAtom = atom(
  null,
  (get, set, { inboxKey, expanded }: { inboxKey: string; expanded: boolean }) => {
    const currentState = get(expandedNotificationGroupsAtom)

    set(expandedNotificationGroupsAtom, { ...currentState, [inboxKey]: expanded })
  }
)

const isNotificationGroupExpandedAtom = (inboxKey: string) =>
  atom(
    (get) => get(expandedNotificationGroupsAtom)[inboxKey] ?? false,
    (get, set, update: boolean) => {
      const currentState = get(expandedNotificationGroupsAtom)

      set(expandedNotificationGroupsAtom, { ...currentState, [inboxKey]: update })
    }
  )

function getGroupedNotificationsByInboxKey(notifications: Notification[]) {
  return notifications
    .sort((a, b) => (b.created_at < a.created_at ? -1 : 1))
    .reduce<Record<string, Notification[]>>((acc, item) => {
      if (!acc[item.inbox_key]) {
        acc[item.inbox_key] = []
      }

      acc[item.inbox_key].push(item)
      return acc
    }, {})
}

// ----------------------------------------------------------------------------

export {
  isNotification,
  expandedNotificationGroupsAtom,
  getGroupedNotificationsByInboxKey,
  isNotificationGroupExpandedAtom,
  setExpandedNotificationGroupAtom
}
