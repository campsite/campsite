import { NextResponse } from 'next/server'

import { routeUnauthorizedResponse, getRouteAccess } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; postId: string }>
}

export async function GET(_: Request, _context: Context) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  return NextResponse.json({
    data: [],
    next_cursor: null,
    prev_cursor: null,
    total_count: 0
  })
}
