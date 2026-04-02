import { api } from '@/convex/_generated/api'

import { getConvexServerClient } from './server'

export async function recordLegacyProductLogs(
  accessToken: string | null | undefined,
  data: {
    events: {
      userId?: string
      orgSlug?: string
      name: string
      dataJson?: string
      logTs?: number
      sessionId?: string
    }[]
    metadataJson?: string
    userAgent?: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.realtime.recordLegacyProductLogs, data)
}

export async function storeLegacyPushSubscription(
  accessToken: string,
  data: {
    oldEndpoint?: string | null
    newEndpoint: string
    p256dh: string
    auth: string
  }
) {
  const client = getConvexServerClient(accessToken)

  return await client.mutation(api.realtime.storeLegacyPushSubscription, data)
}
