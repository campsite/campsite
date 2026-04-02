import { NextResponse } from 'next/server'

import { deleteLegacyTag, getLegacyTag, updateLegacyTag } from '@/lib/convex/tags'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; tagName: string }>
}

export async function GET(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, tagName } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    return NextResponse.json(
      await getLegacyTag(auth.accessToken, {
        slug: orgSlug,
        tagName
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function PATCH(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, tagName } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await updateLegacyTag(auth.accessToken, {
        slug: orgSlug,
        tagName,
        name: typeof body.name === 'string' ? body.name : ''
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, tagName } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    await deleteLegacyTag(auth.accessToken, {
      slug: orgSlug,
      tagName
    })

    return NextResponse.json({})
  } catch (error) {
    return routeErrorResponse(error)
  }
}
