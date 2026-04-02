import { NextResponse } from 'next/server'

import { getLegacyCustomReactionPacks, installLegacyCustomReactionPack } from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function GET(_: Request, { params }: { params: { orgSlug: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyCustomReactionPacks(auth.accessToken, {
        slug: params.orgSlug
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()
  const name = body.name

  if (!['blobs', 'memes', 'meows', 'parrots', 'llamas'].includes(name)) {
    return NextResponse.json({ code: 'unprocessable', message: 'Invalid pack name' }, { status: 422 })
  }

  try {
    return NextResponse.json(
      await installLegacyCustomReactionPack(auth.accessToken, {
        slug: params.orgSlug,
        name: name as 'blobs' | 'memes' | 'meows' | 'parrots' | 'llamas'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
