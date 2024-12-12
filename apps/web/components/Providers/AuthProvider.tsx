import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { appMenu } from '@todesktop/client-core'
import { useGetCurrentUser } from 'hooks/useGetCurrentUser'
import { useRouter } from 'next/router'

import { COMMUNITY_SLUG, WEB_URL } from '@campsite/config'
import { ApiError } from '@campsite/types'
import { useHasMounted, useIsDesktopApp } from '@campsite/ui/src/hooks'

import { FullPageError } from '@/components/Error'
import { FullPageLoading } from '@/components/FullPageLoading'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { signinUrl } from '@/utils/queryClient'

interface Props {
  children: React.ReactNode
  allowLoggedOut: boolean
}

const redirectToSignin = () => window.location.replace(signinUrl({ from: window.location.pathname }))

export function AuthProvider({ children, allowLoggedOut }: Props) {
  const { data: currentUser, isLoading: userIsLoading, error: userError, isSuccess: userSuccess } = useGetCurrentUser()
  const {
    data: organization,
    isLoading: orgIsLoading,
    error: orgError
  } = useGetCurrentOrganization({ enabled: !allowLoggedOut })
  const isDesktop = useIsDesktopApp()
  const router = useRouter()
  const hasMounted = useHasMounted()

  // prefetch organizations — we always need this data
  // prefetching here also reduces layout jank where the Sidebar only loads if we know you're a member of the org being viewed
  const getMemberships = useGetOrganizationMemberships({ enabled: !!currentUser?.logged_in })

  useEffect(() => {
    async function setupMenuItem() {
      if (!isDesktop) return

      const label = 'Account Settings'
      const options = { accelerator: 'Command+,' }

      await appMenu
        .add('File', label, () => (window.location.href = WEB_URL + '/me/settings'), options)
        .catch(() => {
          // Catch error ToDesktop raises when you open a new window from an existing one and try to add a 'File' app menu item.
        })

      await appMenu.refresh()
    }

    if (currentUser?.logged_in) {
      Sentry.setUser({ id: currentUser.id, username: currentUser.username })

      setupMenuItem()
    } else {
      Sentry.setUser(null)
    }
    Sentry.setContext('desktop', { desktop: isDesktop })
  }, [currentUser?.id, currentUser?.logged_in, currentUser?.username, isDesktop])

  if (userError) {
    return <FullPageError message={userError.message} />
  }

  // redirect logged-out users
  if (!allowLoggedOut && currentUser && !currentUser.logged_in) {
    redirectToSignin()
    return null
  }

  // immediately return if we're not on an org-scoped route or logged-out is ok
  if (hasMounted && (!router.query.org || allowLoggedOut)) {
    return <>{children} </>
  }

  // If getCurrentUser didn't error and didn't return data, redirect to login
  if (userSuccess && !currentUser) {
    redirectToSignin()
    return <FullPageLoading />
  }

  // always show loading if we're waiting on the user
  if (userIsLoading) {
    return <FullPageLoading />
  }

  // Handle unauthenticated users
  if (orgError instanceof ApiError) {
    // user is trying to view the community org but isn't a member yet
    if (orgError.code === 'forbidden') {
      if (router.asPath === `/${COMMUNITY_SLUG}`) {
        router.push(`/${COMMUNITY_SLUG}/join`)
        return null
      } else {
        return <FullPageError message={orgError.message} />
      }
    }

    return <FullPageError message={orgError.message} />
  }

  // if on an org scoped route, show a spinner til the org is loaded
  if (orgIsLoading || getMemberships.isLoading) {
    return <FullPageLoading />
  }

  // fallback error if the org is not found
  if (!organization) {
    return <FullPageError message='Organization not found' />
  }

  return <>{children}</>
}
