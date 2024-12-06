import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

import { ApiErrorTypes } from '@campsite/types/generated'

import { FullPageError } from '@/components/Error'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { apiCookieHeaders } from '@/utils/apiCookieHeaders'
import { apiClient, signUpUrl } from '@/utils/queryClient'

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  try {
    const headers = apiCookieHeaders(req.cookies)
    const result = await apiClient.invitationsByToken.postInvitationsByTokenAccept().request(query.token as string, {
      headers
    })

    return {
      redirect: {
        destination: result.redirect_path,
        permanent: true
      }
    }
  } catch (e: any) {
    if (e.name === ApiErrorTypes.AuthenticationError) {
      return {
        redirect: {
          permanent: false,
          destination: signUpUrl({ from: req?.url })
        }
      }
    }

    return { props: { error: { message: e.message } } }
  }
}

const OrganizationInvitePage = ({ error }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return <FullPageError message={error.message} />
}

OrganizationInvitePage.getProviders = (page: any, pageProps: any) => {
  return (
    <AuthAppProviders {...pageProps}>
      <main id='main' className='drag relative flex h-screen w-full flex-col overflow-y-auto' {...pageProps}>
        {page}
      </main>
    </AuthAppProviders>
  )
}

export default OrganizationInvitePage
