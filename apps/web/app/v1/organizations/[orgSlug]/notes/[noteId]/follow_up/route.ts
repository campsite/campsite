import { NextResponse } from 'next/server'

import { createLegacyFollowUp } from '@/lib/convex/engagement'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; noteId: string }>
}

function parseShowAt(value: unknown) {
  if (typeof value !== 'string') {
    throw new Error('unprocessable:show_at is required')
  }

  const timestamp = Date.parse(value)

  if (Number.isNaN(timestamp)) {
    throw new Error('unprocessable:show_at must be a valid ISO datetime')
  }

  return timestamp
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, noteId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyFollowUp(auth.accessToken, {
        slug: orgSlug,
        subjectType: 'Note',
        subjectId: noteId,
        showAt: parseShowAt(body.show_at)
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
