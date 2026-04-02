import { NextResponse } from 'next/server'

import { createLegacyThreadMessage, getLegacyThreadMessages } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; threadId: string }>
}

export async function GET(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const { searchParams } = new URL(request.url)

  try {
    return NextResponse.json(
      await getLegacyThreadMessages(auth.accessToken, {
        slug: orgSlug,
        threadId,
        after: searchParams.get('after') || undefined,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, threadId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyThreadMessage(auth.accessToken, {
        slug: orgSlug,
        threadId,
        content: typeof body.content === 'string' ? body.content : '',
        replyTo: typeof body.reply_to === 'string' ? body.reply_to : undefined,
        attachments: Array.isArray(body.attachments) ? body.attachments : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
