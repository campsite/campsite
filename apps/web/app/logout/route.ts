import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return redirect('/auth/logout')
}
