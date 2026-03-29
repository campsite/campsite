import { NextResponse } from 'next/server'

import { createLegacyNoteAttachment } from '@/lib/convex/notes'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

interface Context {
  params: Promise<{ orgSlug: string; noteId: string }>
}

export async function POST(request: Request, context: Context) {
  const auth = await getRouteAccess()
  const { orgSlug, noteId } = await context.params

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  const body = await request.json()

  try {
    return NextResponse.json(
      await createLegacyNoteAttachment(auth.accessToken, {
        slug: orgSlug,
        noteId,
        duration: typeof body.duration === 'number' ? body.duration : undefined,
        file_path: typeof body.file_path === 'string' ? body.file_path : '',
        file_type: typeof body.file_type === 'string' ? body.file_type : '',
        gallery_id: typeof body.gallery_id === 'string' || body.gallery_id === null ? body.gallery_id : undefined,
        height: typeof body.height === 'number' ? body.height : undefined,
        name: typeof body.name === 'string' || body.name === null ? body.name : undefined,
        no_video_track: typeof body.no_video_track === 'boolean' ? body.no_video_track : undefined,
        position: typeof body.position === 'number' ? body.position : 0,
        preview_file_path:
          typeof body.preview_file_path === 'string' || body.preview_file_path === null
            ? body.preview_file_path
            : undefined,
        size: typeof body.size === 'number' || body.size === null ? body.size : undefined,
        width: typeof body.width === 'number' ? body.width : undefined
      })
    )
  } catch (error) {
    return routeErrorResponse(error)
  }
}
