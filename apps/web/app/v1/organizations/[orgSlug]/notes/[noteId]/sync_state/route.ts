import { NextResponse } from 'next/server'

import { verifyEditorSyncToken } from '@/lib/auth/syncToken'
import {
  getLegacyNoteSyncState,
  getLegacyNoteSyncStateByGrant,
  updateLegacyNoteSyncState,
  updateLegacyNoteSyncStateByGrant,
} from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; noteId: string }>
}

async function getSyncRouteAccess(request: Request) {
  const authorization = request.headers.get('authorization')
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (bearerToken) {
    const syncToken = verifyEditorSyncToken(bearerToken)

    if (!syncToken) {
      return null
    }

    return { syncToken }
  }

  return await getRouteAccess()
}

export async function GET(request: Request, context: Context) {
  const auth = await getSyncRouteAccess(request)
  const { orgSlug, noteId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    if ('syncToken' in auth) {
      if (auth.syncToken.orgSlug !== orgSlug || auth.syncToken.noteId !== noteId || auth.syncToken.resourceType !== 'Note') {
        return routeUnauthorizedResponse()
      }

      return NextResponse.json(
        await getLegacyNoteSyncStateByGrant({
          grantId: auth.syncToken.grantId,
          slug: orgSlug,
          noteId
        })
      )
    }

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

  if (!auth) {
    return routeUnauthorizedResponse()
  }
  const body = await request.json()

  try {
    if ('syncToken' in auth) {
      if (auth.syncToken.orgSlug !== orgSlug || auth.syncToken.noteId !== noteId || auth.syncToken.resourceType !== 'Note') {
        return routeUnauthorizedResponse()
      }

      return NextResponse.json(
        await updateLegacyNoteSyncStateByGrant({
          description_html: typeof body.description_html === 'string' ? body.description_html : '',
          description_schema_version:
            typeof body.description_schema_version === 'number' ? body.description_schema_version : 0,
          description_state: typeof body.description_state === 'string' ? body.description_state : '',
          grantId: auth.syncToken.grantId,
          noteId,
          slug: orgSlug
        })
      )
    }

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
