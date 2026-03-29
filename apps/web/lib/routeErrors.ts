import { NextResponse } from 'next/server'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Request failed'
}

export function routeErrorResponse(error: unknown) {
  const rawMessage = getErrorMessage(error)
  const [code, ...rest] = rawMessage.split(':')
  const message = rest.length > 0 ? rest.join(':').trim() : rawMessage

  if (code === 'unauthorized') {
    return NextResponse.json({ code, message }, { status: 401 })
  }

  if (code === 'forbidden') {
    return NextResponse.json({ code, message }, { status: 403 })
  }

  if (code === 'not_found') {
    return NextResponse.json({ code, message }, { status: 404 })
  }

  if (code === 'unprocessable') {
    return NextResponse.json({ code, message }, { status: 422 })
  }

  if (code === 'service_unavailable') {
    return NextResponse.json({ code, message }, { status: 503 })
  }

  return NextResponse.json(
    {
      code: 'unprocessable',
      message
    },
    { status: 422 }
  )
}
