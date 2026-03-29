import { NextResponse } from 'next/server'

import { verifyEditorSyncToken } from '@/lib/auth/syncToken'
import { getLegacyNoteSyncState, updateLegacyNoteSyncState } from '@/lib/convex/notes'
import { ensureWorkspace } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; noteId: string }>
}

async function getSyncRouteAccess(request: Request) {
  const authorization = request.headers.get('authorization')
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (bearerToken) {
    const accessToken = verifyEditorSyncToken(bearerToken)

    if (!accessToken) {
      return null
    }

    await ensureWorkspace(accessToken)

    return { accessToken }
  }

  return await getRouteAccess()
}

export async function GET(request: Request, context: Context) {
  const auth = await getSyncRouteAccess(request)
  const { orgSlug, noteId } = await context.params

  if (!auth?.accessToken) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyNoteSyncState(auth.accessToken, {
        slug: orgSlug,
        noteId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function PUT(request: Request, context: Context) {
  const auth = await getSyncRouteAccess(request)
  const { orgSlug, noteId } = await context.params

  if (!auth?.accessToken) {
    return routeUnauthorizedResponse()
  }
  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyNoteSyncState(auth.accessToken, {
        slug: orgSlug,
        noteId,
        description_html: typeof body.description_html === 'string' ? body.description_html : '',
        description_state: typeof body.description_state === 'string' ? body.description_state : '',
        description_schema_version:
          typeof body.description_schema_version === 'number' ? body.description_schema_version : 0
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
