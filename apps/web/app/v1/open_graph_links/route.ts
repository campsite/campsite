import { NextResponse } from 'next/server'

import { api } from '@/convex/_generated/api'
import { getConvexServerClient } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return NextResponse.json({ message: 'url is required' }, { status: 422 })
  }

  try {
    const client = getConvexServerClient()
    const payload = await client.query(api.content.getLegacyOpenGraphLink, {
      url: targetUrl
    })

    return NextResponse.json(payload)
  } catch (error) {
    return routeErrorResponse(error)
  }
}
