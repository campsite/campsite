import { GetServerSideProps } from 'next'

import { ApiErrorTypes } from '@campsite/types'

import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { apiCookieHeaders } from '@/utils/apiCookieHeaders'
import { apiClient, signinUrl } from '@/utils/queryClient'
import { PageWithLayout } from '@/utils/types'

const DigestPage: PageWithLayout<any> = () => {
  return null
}

DigestPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default DigestPage

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  try {
    const headers = apiCookieHeaders(req.cookies)
    const result = await apiClient.organizations.getDigestsMigrations().request(`${query?.org}`, `${query?.digestId}`, {
      headers
    })

    if (result.note_url) {
      return {
        redirect: {
          destination: result.note_url,
          permanent: true
        }
      }
    }
  } catch (e: any) {
    if (e.name === ApiErrorTypes.AuthenticationError) {
      return {
        redirect: {
          permanent: false,
          destination: signinUrl({ from: req?.url })
        }
      }
    } else if (e.name === ApiErrorTypes.ForbiddenError) {
      return { notFound: true }
    } else if (e.name === ApiErrorTypes.NotFoundError) {
      return { notFound: true }
    } else {
      throw e
    }
  }
  return {
    notFound: true
  }
}
