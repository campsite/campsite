import { NextResponse } from 'next/server'

import { uninstallLegacyCustomReactionPack } from '@/lib/convex/collaboration'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

export async function DELETE(_: Request, { params }: { params: { orgSlug: string; name: string } }) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  if (!['blobs', 'memes', 'meows', 'parrots', 'llamas'].includes(params.name)) {
    return NextResponse.json({ code: 'unprocessable', message: 'Invalid pack name' }, { status: 422 })
  }

  try {
    return NextResponse.json(
      await uninstallLegacyCustomReactionPack(auth.accessToken, {
        slug: params.orgSlug,
        name: params.name as 'blobs' | 'memes' | 'meows' | 'parrots' | 'llamas'
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
