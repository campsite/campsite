import { getUploadFieldsResponse, handleUploadResponse } from '../../../../_utils/upload'

export async function GET(request: Request) {
  return getUploadFieldsResponse(request)
}

export async function POST(request: Request) {
  return handleUploadResponse(request)
}
