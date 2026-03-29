import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

import { getDefaultZapierProject } from '../_helpers'

export async function GET(request: Request) {
  const auth = await getRouteAccess()

  if (!auth) {
    return routeUnauthorizedResponse()
  }

  try {
    const { projects } = await getDefaultZapierProject(auth.accessToken)
    const name = new URL(request.url).searchParams.get('name')?.toLowerCase()
    const data = projects.data
      .filter((project: any) => !name || project.name.toLowerCase().includes(name))
      .map((project: any) => ({ id: project.id, name: project.name }))

    return NextResponse.json({
      next_cursor: null,
      prev_cursor: null,
      data
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
