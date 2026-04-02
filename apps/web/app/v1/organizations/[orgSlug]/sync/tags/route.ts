import { NextResponse } from 'next/server'

import { getLegacySyncTags } from '@/lib/convex/tags'
import { getRouteAccess } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug } = await context.params

  if (!auth) {
    return NextResponse.json([])
  }

  return NextResponse.json(
    await getLegacySyncTags(auth.accessToken, {
      slug: orgSlug
    })
  )
}
