import { NextResponse } from 'next/server'

import { deleteLegacyThread, getLegacyThread, updateLegacyThread } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; threadId: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { threadId, orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await getLegacyThread(auth.accessToken, { slug: orgSlug, threadId }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function PUT(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { threadId, orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyThread(auth.accessToken, {
        slug: orgSlug,
        threadId,
        title: typeof body.title === 'string' ? body.title : undefined,
        imagePath:
          typeof body.image_path === 'string' || body.image_path === null ? body.image_path : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { threadId, orgSlug } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(await deleteLegacyThread(auth.accessToken, { slug: orgSlug, threadId }))
  } catch (error) {
    return routeErrorResponse(error)
  }
}
