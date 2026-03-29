import { NextResponse } from 'next/server'

import { getLegacyPublicNote } from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'

interface Context {
  params: Promise<{ orgSlug: string; noteId: string }>
}

export async function GET(_: Request, context: Context) {
  const { orgSlug, noteId } = await context.params

  try {
    return NextResponse.json(
      await getLegacyPublicNote(null, {
        slug: orgSlug,
        noteId
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
