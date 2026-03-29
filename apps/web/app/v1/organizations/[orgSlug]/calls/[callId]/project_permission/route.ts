import { NextResponse } from 'next/server'

import { getCallsCompatClient } from '../../_compat'

import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; callId: string }>
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()
  const client = getCallsCompatClient(auth.accessToken)

  try {
    return NextResponse.json(
      await client.updateProjectPermission({
        slug: orgSlug,
        callId,
        projectId: typeof body.project_id === 'string' ? body.project_id : '',
        permission: body.permission === 'edit' ? 'edit' : 'view'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, callId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const client = getCallsCompatClient(auth.accessToken)

  try {
    await client.deleteProjectPermission({
      slug: orgSlug,
      callId
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
