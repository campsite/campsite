import { NextResponse } from 'next/server'

import { completeLegacyDataExport } from '@/lib/convex/adminOps'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'
import { routeErrorResponse } from '@/lib/routeErrors'

export async function PUT(request: Request, { params }: { params: { publicId: string } }) {
  const routeAccess = await getRouteAccess()

  if (!routeAccess?.accessToken) {
    return routeUnauthorizedResponse()
  }

  try {
    const body = await request.json()

    if (typeof body?.zip_path !== 'string' || !body.zip_path) {
      return NextResponse.json({ code: 'unprocessable', message: 'zip_path is required' }, { status: 422 })
    }

    await completeLegacyDataExport(routeAccess.accessToken, {
      publicId: params.publicId,
      zipPath: body.zip_path
    })

    return NextResponse.json({})
  } catch (error) {
    return routeErrorResponse(error)
  }
}
