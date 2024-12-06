import { GetServerSideProps } from 'next'
import { userAgentFromString } from 'next/server'

import { SCOPE_COOKIE_NAME } from '@campsite/config'
import { ApiErrorTypes } from '@campsite/types'

import { apiCookieHeaders } from '@/utils/apiCookieHeaders'
import { apiClient, signinUrl } from '@/utils/queryClient'

export default function IndexPage() {
  return <></>
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  try {
    const headers = apiCookieHeaders(req.cookies)
    const organizations = await apiClient.organizationMemberships
      .getOrganizationMemberships()
      .request({ headers })
      .then((res) => res.map((m) => m.organization))

    // if we have orgs redirect to one of the user orgs
    // otherwise redirect to the new org page
    if (organizations.length > 0) {
      let org = organizations[0]
      const scope = req.cookies[SCOPE_COOKIE_NAME]

      if (scope) {
        const scopeOrg = organizations.find((o) => o.slug == scope)

        if (scopeOrg) {
          org = scopeOrg
        }
      }

      const { device } = userAgentFromString(req.headers['user-agent'])

      if (device.type === 'mobile') {
        return {
          redirect: {
            destination: `/${org.slug}/${query.path ?? 'home'}`,
            permanent: false
          }
        }
      }
      return {
        redirect: {
          destination: `/${org.slug}/${query.path ?? ''}`,
          permanent: false
        }
      }
    } else {
      return {
        redirect: {
          destination: '/new',
          permanent: false
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
    } else if (e.name === ApiErrorTypes.NotFoundError) {
      return { notFound: true }
    } else {
      throw e
    }
  }
}
