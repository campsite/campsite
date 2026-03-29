import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createEditorSyncToken } from '@/lib/auth/syncToken'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { routeUnauthorizedResponse } from '@/lib/routeSession'

export async function POST() {
  const { accessToken, user } = await withAuth()

  if (!accessToken) {
    return routeUnauthorizedResponse()
  }

  try {
    await ensureWorkspace(accessToken, user)

    return NextResponse.json(
      {
        token: createEditorSyncToken(accessToken)
      },
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
