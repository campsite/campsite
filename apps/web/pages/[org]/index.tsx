import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { userAgentFromString } from 'next/server'

import { WEB_URL } from '@campsite/config'

import { AppLayout } from '@/components/Layout/AppLayout'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { allowedSavedScopePaths, disallowedScopePaths, scopePathCookieName } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { PageWithLayout } from '@/utils/types'

const OrganizationHomeFeedPage: PageWithLayout<any> = () => {
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data

  return (
    <>
      <Head>
        <title>{currentOrganization?.name}</title>
      </Head>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const scope = query.org as string
  const scopePath = req.cookies[scopePathCookieName(scope)]
  const referer = req.headers.referer
  const refererPathname = referer ? new URL(referer).pathname : undefined
  const scopePathname = scopePath ? new URL(scopePath, WEB_URL).pathname : undefined

  if (
    scopePath &&
    allowedSavedScopePaths.some((p) => scopePath.startsWith(`/${scope}/${p}`)) &&
    !disallowedScopePaths.some((p) => scopePath.startsWith(`/${scope}/${p}`)) &&
    /**
     * Avoid redirect if the referer is the same as the saved scope path
     * as it will result in circular loop and the user will get stuck on that page.
     *
     * /[org]/referer -> /[org] -> /[org]/scopePath
     *
     * Also make sure that we are comparing the **pathname**, and not the full path
     * which includes hashes and query params. Otherwise, we'll still end up in a
     * circular loop.
     *
     *  - refererPath: '/frontier-forest/posts/z3rr49vkphx3',
     *  - scopePath: '/frontier-forest/posts/z3rr49vkphx3#comment-gc2wkp70k00x'
     *
     * In the example above, the redirect will only change the hash on the current page,
     * which breaks the back button.
     */
    scopePathname !== refererPathname
  ) {
    return {
      redirect: {
        destination: scopePath,
        permanent: false
      }
    }
  }

  const { device } = userAgentFromString(req.headers['user-agent'])

  return {
    redirect: {
      destination: device.type === 'mobile' ? `/${scope}/home` : `/${scope}/posts`,
      permanent: false
    }
  }
}

OrganizationHomeFeedPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default OrganizationHomeFeedPage
