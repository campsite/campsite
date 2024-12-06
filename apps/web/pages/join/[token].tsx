import { useJoinOrganization } from 'hooks/useJoinOrganization'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { Avatar, Body, Button, Title1 } from '@campsite/ui'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { FullPageError } from '@/components/Error'
import { FullPageLoading } from '@/components/FullPageLoading'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { BasicTitlebar } from '@/components/Titlebar'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetOrganizationByToken } from '@/hooks/useGetOrganizationByToken'
import { useSignoutUser } from '@/hooks/useSignoutUser'
import { PageWithLayout } from '@/utils/types'

const JoinOrganizationPage: PageWithLayout<any> = () => {
  const router = useRouter()
  const token = router.query.token as string
  const joinOrganization = useJoinOrganization()
  const { data: currentUser } = useGetCurrentUser()
  const getOrganizationByToken = useGetOrganizationByToken(token)
  const signout = useSignoutUser()

  async function handleJoin() {
    const scope = getOrganizationByToken?.data?.slug

    if (!scope) return

    joinOrganization.mutate(
      { token, scope },
      {
        onSuccess: async (result: any) => {
          if (result.joined) {
            router.push(`/${result.slug}`)
            toast(`Joined the ${result.name} organization!`)
          } else {
            router.push(`/me/settings/organizations`)
            toast(`You have requested to join the ${result.name} organization.`)
          }
        }
      }
    )
  }

  if (getOrganizationByToken.isLoading) {
    return <FullPageLoading />
  }

  if (getOrganizationByToken.error) {
    return <FullPageError message={getOrganizationByToken.error.message} />
  }

  if (!getOrganizationByToken.data) {
    return <FullPageError message='This token is not associated with an active organization' />
  }

  const organization = getOrganizationByToken.data

  return (
    <>
      <CopyCurrentUrl />

      <Head>
        <title>Join {organization?.name ?? 'organization'}</title>
      </Head>

      <BasicTitlebar
        leadingSlot={null}
        trailingSlot={
          <Button variant='plain' onClick={() => signout.mutate()}>
            Log out
          </Button>
        }
        disableBottomBorder
      />

      <div className='flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center'>
        <div className='relative flex-none'>
          <Avatar urls={organization.avatar_urls} rounded='rounded-lg' size='xl' name={organization.name} />
          <div className='absolute -bottom-2.5 -right-2.5 rounded-full border-4 border-white dark:border-gray-950'>
            <Avatar size='sm' name={currentUser?.display_name} urls={currentUser?.avatar_urls} />
          </div>
        </div>

        <Title1 weight='font-semibold'>Join {organization.name}</Title1>

        <Body secondary className='max-w-md'>
          You are invited to join {organization.name}.
        </Body>

        <Button
          size='large'
          variant='primary'
          disabled={joinOrganization.isPending}
          onClick={handleJoin}
          className='mt-8 min-w-40'
        >
          Join
        </Button>
      </div>
    </>
  )
}

JoinOrganizationPage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <main id='main' className='drag relative flex h-screen w-full flex-col overflow-y-auto' {...pageProps}>
        {page}
      </main>
    </AuthAppProviders>
  )
}

export default JoinOrganizationPage
