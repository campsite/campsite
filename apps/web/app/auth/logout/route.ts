import { signOut } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  await signOut({ returnTo: '/login' })

  return redirect('/login')
}
