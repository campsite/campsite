import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { FullPageError } from '@/components/Error'
import { FullPageLoading } from '@/components/FullPageLoading'
import AppProviders from '@/components/Providers/AppProviders'
import { useCreateDesktopSession } from '@/hooks/useCreateDesktopSession'
import { PageWithProviders } from '@/utils/types'

const DesktopAuthPage: PageWithProviders<any> = () => {
  const router = useRouter()
  const createDesktopSession = useCreateDesktopSession()

  useEffect(() => {
    if (router.query.email && router.query.token) {
      const createSession = async () => {
        createDesktopSession.mutate(
          { user: { email: router.query.email as string, token: router.query.token as string } },
          {
            onSuccess() {
              router.push('/')
            }
          }
        )
      }

      createSession()
    }
  }, [router.query.email, router.query.token]) // eslint-disable-line react-hooks/exhaustive-deps

  const error = createDesktopSession.error as any

  if (error) {
    return <FullPageError message={error.message} />
  }

  return <FullPageLoading />
}

DesktopAuthPage.getProviders = (page, pageProps) => {
  return <AppProviders {...pageProps}>{page}</AppProviders>
}

export default DesktopAuthPage
