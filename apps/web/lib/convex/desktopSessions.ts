import { api } from '@/convex/_generated/api'
import { getConvexServerClient } from '@/lib/convex/server'

export async function createDesktopSessionGrant(
  accessToken: string,
  data: {
    refreshToken: string
    userJson: string
    impersonatorJson?: string
    returnTo?: string
  }
) {
  return await getConvexServerClient(accessToken).mutation(api.desktopSessions.createDesktopSessionGrant, {
    accessToken,
    refreshToken: data.refreshToken,
    userJson: data.userJson,
    impersonatorJson: data.impersonatorJson,
    returnTo: data.returnTo
  })
}

export async function redeemDesktopSessionGrant(data: { grantId: string }) {
  return await getConvexServerClient().mutation(api.desktopSessions.redeemDesktopSessionGrant, data)
}
