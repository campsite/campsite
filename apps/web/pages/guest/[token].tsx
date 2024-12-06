import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { FullPageError } from '@/components/Error'
import { FullPageLoading } from '@/components/FullPageLoading'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { useAcceptProjectInvitationUrl } from '@/hooks/useAcceptProjectInvitationUrl'
import { useGetProjectByToken } from '@/hooks/useGetProjectByToken'
import { PageWithLayout } from '@/utils/types'

const JoinProjectPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const token = router.query.token as string
  const { mutate: acceptInvitation, error: acceptInvitationError } = useAcceptProjectInvitationUrl()
  const { data: project, error: projectError, isLoading: isProjectLoading } = useGetProjectByToken(token)

  useEffect(() => {
    if (!project) return
    const { organization } = project

    acceptInvitation(
      { orgSlug: organization.slug, projectId: project.id, token },
      {
        onSuccess: () => {
          window.location.href = `/${organization.slug}/projects/${project.id}`
        }
      }
    )
  }, [acceptInvitation, project, token])

  if (projectError) {
    return <FullPageError message={projectError.message} />
  }

  if (acceptInvitationError) {
    return <FullPageError message={acceptInvitationError.message} />
  }

  if (!isProjectLoading && !project) {
    return <FullPageError message='This token is not associated with an active organization' />
  }

  return <FullPageLoading />
}

JoinProjectPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <main id='main' className='drag relative flex h-screen w-full flex-col overflow-y-auto' {...pageProps}>
        {page}
      </main>
    </AuthAppProviders>
  )
}

export default JoinProjectPage
