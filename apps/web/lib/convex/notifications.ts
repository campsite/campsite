import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

export async function getLegacyUnreadNotificationCounts(accessToken: string) {
  return await getConvexServerClient(accessToken).query(api.notifications.getLegacyUnreadNotificationCounts, {})
}

export async function getLegacyNotificationsPage(
  accessToken: string,
  data: {
    slug: string
    unread?: boolean
    filter?: 'home' | 'grouped_home' | 'activity'
    archived?: boolean
    after?: string
    limit?: number
  }
) {
  return await getConvexServerClient(accessToken).query(api.notifications.getLegacyNotificationsPage, data)
}

export async function markLegacyNotificationRead(
  accessToken: string,
  data: { slug: string; notificationId: string; read: boolean }
) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.markLegacyNotificationRead, data)
}

export async function markLegacyNotificationsRead(accessToken: string, data: { slug: string }) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.markLegacyNotificationsRead, data)
}

export async function deleteLegacyNotification(
  accessToken: string,
  data: { slug: string; notificationId: string; archiveBy?: 'id' | 'target' }
) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.deleteLegacyNotification, data)
}

export async function unarchiveLegacyNotification(
  accessToken: string,
  data: { slug: string; notificationId: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.unarchiveLegacyNotification, data)
}

export async function deleteAllLegacyNotifications(
  accessToken: string,
  data: { slug: string; readOnly?: boolean }
) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.deleteAllLegacyNotifications, data)
}

export async function getLegacyViewerStatuses(accessToken: string, slug: string) {
  return await getConvexServerClient(accessToken).query(api.notifications.getLegacyViewerStatuses, { slug })
}

export async function upsertLegacyViewerStatus(
  accessToken: string,
  data: {
    slug: string
    emoji?: string
    message?: string
    expirationSetting?: '30m' | '1h' | '4h' | 'today' | 'this_week' | 'custom'
    expiresAt?: number | null
    pauseNotifications?: boolean
  }
) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.upsertLegacyViewerStatus, data)
}

export async function deleteLegacyViewerStatus(accessToken: string, slug: string) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.deleteLegacyViewerStatus, { slug })
}

export async function createLegacyNotificationPause(accessToken: string, expiresAt: number) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.createLegacyNotificationPause, { expiresAt })
}

export async function deleteLegacyNotificationPause(accessToken: string) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.deleteLegacyNotificationPause, {})
}

export async function getLegacyNotificationSchedule(accessToken: string) {
  return await getConvexServerClient(accessToken).query(api.notifications.getLegacyNotificationSchedule, {})
}

export async function updateLegacyNotificationSchedule(
  accessToken: string,
  data: { days: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[]; startTime: string; endTime: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.updateLegacyNotificationSchedule, data)
}

export async function deleteLegacyNotificationSchedule(accessToken: string) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.deleteLegacyNotificationSchedule, {})
}

export async function getLegacyScheduledNotifications(accessToken: string) {
  return await getConvexServerClient(accessToken).query(api.notifications.getLegacyScheduledNotifications, {})
}

export async function createLegacyScheduledNotification(
  accessToken: string,
  data: { name: string; timeZone: string; deliveryDay?: string | null; deliveryTime: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.createLegacyScheduledNotification, data)
}

export async function updateLegacyScheduledNotification(
  accessToken: string,
  data: { id: string; timeZone: string; deliveryDay?: string | null; deliveryTime: string }
) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.updateLegacyScheduledNotification, data)
}

export async function deleteLegacyScheduledNotification(accessToken: string, id: string) {
  return await getConvexServerClient(accessToken).mutation(api.notifications.deleteLegacyScheduledNotification, { id })
}
