import { getConvexServerClient } from './server'

async function callRealtimeFunction<T>(accessToken: string | null | undefined, name: string, args: Record<string, unknown>) {
  const client = getConvexServerClient(accessToken)

  return (await (client as any).function(name, undefined, args)) as T
}

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
  return await callRealtimeFunction(accessToken, 'realtime:recordLegacyProductLogs', data)
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
  return await callRealtimeFunction(accessToken, 'realtime:storeLegacyPushSubscription', data)
}
