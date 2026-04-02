import { NextResponse } from 'next/server'

import { getLegacyOrganization, uploadLegacyFile } from '@/lib/convex/server'
import { routeErrorResponse } from '@/lib/routeErrors'
import { getRouteAccess, routeUnauthorizedResponse } from '@/lib/routeSession'

function buildUploadUrl(request: Request) {
  const url = new URL(request.url)

  url.search = ''

  return url.toString()
}

function buildPresignedFields(request: Request) {
  return {
    acl: null,
    content_type: new URL(request.url).searchParams.get('mime_type') || '',
    expires: '',
    key: '',
    policy: '',
    success_action_status: '200',
    url: buildUploadUrl(request),
    x_amz_algorithm: 'convex',
    x_amz_credential: '',
    x_amz_date: '',
    x_amz_signature: ''
  }
}

async function ensureOrganizationAccess(accessToken: string, orgSlug: string) {
  const organization = await getLegacyOrganization(accessToken, orgSlug)

  if (!organization) {
    throw new Error('not_found: Organization not found')
  }
}

interface UploadOptions {
  orgSlug?: string
}

async function authorizeUpload(options?: UploadOptions) {
  const routeAccess = await getRouteAccess()

  if (!routeAccess) {
    return {
      accessToken: null,
      response: routeUnauthorizedResponse()
    }
  }

  if (options?.orgSlug) {
    await ensureOrganizationAccess(routeAccess.accessToken, options.orgSlug)
  }

  return {
    accessToken: routeAccess.accessToken,
    response: null
  }
}

export async function getUploadFieldsResponse(request: Request, options?: UploadOptions) {
  try {
    const auth = await authorizeUpload(options)

    if (auth.response) {
      return auth.response
    }

    if (!auth.accessToken) {
      return routeUnauthorizedResponse()
    }

    return NextResponse.json(buildPresignedFields(request))
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function handleUploadResponse(request: Request, options?: UploadOptions) {
  try {
    const auth = await authorizeUpload(options)

    if (auth.response) {
      return auth.response
    }

    if (!auth.accessToken) {
      return routeUnauthorizedResponse()
    }

    const body = await request.arrayBuffer()

    if (body.byteLength === 0) {
      return NextResponse.json({ code: 'invalid_request', message: 'File is required' }, { status: 400 })
    }

    const parsedSize = Number(request.headers.get('x-campsite-upload-size') || body.byteLength)

    const upload = await uploadLegacyFile(auth.accessToken, {
      contentType: request.headers.get('content-type') || undefined,
      file: body,
      name: request.headers.get('x-campsite-upload-name') || 'upload',
      size: Number.isFinite(parsedSize) ? parsedSize : body.byteLength
    })

    return NextResponse.json({
      key: upload.key,
      url: upload.url
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
