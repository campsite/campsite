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
    const grant = typeof router.query.grant === 'string' ? router.query.grant : null
    const legacyToken = typeof router.query.token === 'string' ? router.query.token : null
    const token = grant ?? legacyToken
    const returnTo = typeof router.query.from === 'string' ? router.query.from : '/'

    if (token) {
      const createSession = async () => {
        createDesktopSession.mutate(
          { user: { email: (router.query.email as string) || 'desktop@campsite.local', token } },
          {
            onSuccess(data: any) {
              router.push(data?.return_to || returnTo)
            }
          }
        )
      }

      createSession()
    }
  }, [router.query.email, router.query.from, router.query.grant, router.query.token]) // eslint-disable-line react-hooks/exhaustive-deps

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
