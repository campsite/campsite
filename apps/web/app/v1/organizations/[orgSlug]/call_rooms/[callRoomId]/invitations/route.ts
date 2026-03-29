import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

import { getCallRoomsCompatClient } from '../../_compat'

interface Context {
  params: Promise<{ orgSlug: string; callRoomId: string }>
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callRoomId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = (await request.json().catch(() => null)) as { member_ids?: string[] } | null

  if (!body?.member_ids || !Array.isArray(body.member_ids)) {
    return NextResponse.json({ code: 'invalid_request', message: 'member_ids is required.' }, { status: 400 })
  }

  const client = getCallRoomsCompatClient(auth.accessToken)

  try {
    await client.createInvitations({
      slug: orgSlug,
      callRoomId,
      memberIds: body.member_ids
    })

    return NextResponse.json({})
  } catch (error) {
    return routeErrorResponse(error)
  }
}
