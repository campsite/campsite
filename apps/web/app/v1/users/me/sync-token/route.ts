import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { createEditorSyncToken } from '@/lib/auth/syncToken'
import { createLegacyNoteSyncGrant } from '@/lib/convex/notes'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { routeUnauthorizedResponse } from '@/lib/routeSession'

export async function POST(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!accessToken) {
    return routeUnauthorizedResponse()
  }

  try {
    await ensureWorkspace(accessToken, user)
    const body = await request.json().catch(() => null)
    const orgSlug = typeof body?.orgSlug === 'string' ? body.orgSlug : null
    const noteId = typeof body?.resourceId === 'string' ? body.resourceId : null
    const resourceType = body?.resourceType === 'Note' ? 'Note' : null

    if (!orgSlug || !noteId || !resourceType) {
      return NextResponse.json(
        { code: 'invalid_request', message: 'orgSlug, resourceId, and resourceType are required' },
        { status: 400 }
      )
    }

    const grant = await createLegacyNoteSyncGrant(accessToken, {
      slug: orgSlug,
      noteId,
      resourceType
    })

    return NextResponse.json(
      {
        token: createEditorSyncToken({
          grantId: grant.grantId,
          noteId,
          orgSlug,
          resourceType
        })
      },
      { status: 201 }
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
