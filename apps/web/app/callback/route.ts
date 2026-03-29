import { handleAuth } from '@workos-inc/authkit-nextjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const GET = handleAuth({
  returnPathname: '/auth/complete'
})
