import { saveSession } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { redeemDesktopSessionGrant } from '@/lib/convex/desktopSessions'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export const runtime = 'nodejs'

interface DesktopSessionBody {
  user?: {
    email?: string
    token?: string
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as DesktopSessionBody | null
    const grantId = body?.user?.token?.trim()

    if (!grantId) {
      return NextResponse.json({ code: 'invalid_request', message: 'Desktop grant token is required' }, { status: 400 })
    }

    const grant = await redeemDesktopSessionGrant({ grantId })
    const user = JSON.parse(grant.userJson)
    const impersonator = grant.impersonatorJson ? JSON.parse(grant.impersonatorJson) : undefined

    await ensureWorkspace(grant.accessToken, user)
    await saveSession(
      {
        accessToken: grant.accessToken,
        refreshToken: grant.refreshToken,
        user,
        impersonator
      },
      request.url
    )

    return NextResponse.json({ return_to: grant.returnTo }, { status: 201 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
