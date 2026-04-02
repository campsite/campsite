import { NextResponse } from 'next/server'

import { createLegacyThreadMessage } from '@/lib/convex/threads'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

import { getDefaultZapierOrg } from '../_helpers'

export async function POST(request: Request) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = (await request.json().catch(() => null)) as
    | {
        content?: string
        thread_id?: string
        parent_id?: string
      }
    | null

  try {
    const organization = await getDefaultZapierOrg(auth.accessToken)
    const response: any = await createLegacyThreadMessage(auth.accessToken, {
      slug: organization.slug,
      threadId: body?.thread_id || '',
      content: body?.content || '',
      replyTo: body?.parent_id || undefined
    })
    const message = response.message

    return NextResponse.json({
      id: message.id,
      content: message.content,
      created_at: message.created_at,
      updated_at: message.updated_at,
      parent_id: body?.parent_id || null
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
