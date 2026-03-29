import { getUploadFieldsResponse, handleUploadResponse } from '../../../../_utils/upload'

export async function GET(request: Request, { params }: { params: { orgSlug: string } }) {
  return getUploadFieldsResponse(request, { orgSlug: params.orgSlug })
}

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  return handleUploadResponse(request, { orgSlug: params.orgSlug })
}
