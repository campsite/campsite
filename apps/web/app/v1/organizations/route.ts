import { withAuth } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

import { normalizeLegacyOrganization } from '@/lib/convex/compat'
import { createOrganization, ensureWorkspace } from '@/lib/convex/server'

export async function POST(request: Request) {
  const { accessToken, user } = await withAuth()

  if (!user || !accessToken) {
    return NextResponse.json({ code: 'unauthorized', message: 'Sign in required' }, { status: 401 })
  }

  const body = await request.json()

  if (typeof body.name !== 'string' || typeof body.slug !== 'string') {
    return NextResponse.json({ code: 'invalid_request', message: 'Name and slug are required.' }, { status: 400 })
  }

  await ensureWorkspace(accessToken, user)

  try {
    const organization = await createOrganization(accessToken, {
      avatarPath: typeof body.avatar_path === 'string' ? body.avatar_path : undefined,
      name: body.name,
      orgSize: typeof body.org_size === 'string' ? body.org_size : undefined,
      role: typeof body.role === 'string' ? body.role : undefined,
      slug: body.slug,
      source: typeof body.source === 'string' ? body.source : undefined,
      why: typeof body.why === 'string' ? body.why : undefined
    })

    return NextResponse.json(normalizeLegacyOrganization(organization))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Organization could not be created.'
    const status = message.includes('already taken') ? 409 : 400
    const code = message.includes('already taken') ? 'slug_taken' : 'invalid_request'

    return NextResponse.json({ code, message }, { status })
  }
}
