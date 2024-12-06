import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

import { COMMUNITY_SLUG } from '@campsite/config'
import { Button, Link, UIText } from '@campsite/ui'

import { FullPageLoading } from '@/components/FullPageLoading'
import { BasicTitlebar } from '@/components/Titlebar'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetOrganizationByToken } from '@/hooks/useGetOrganizationByToken'
import { useJoinOrganization } from '@/hooks/useJoinOrganization'
import { apiErrorToast } from '@/utils/apiErrorToast'

import { FullPageError } from '../Error'
import { ScrollableContainer } from '../ScrollableContainer'

export function JoinCommunityPageComponent() {
  const getCurrentOrganization = useGetCurrentOrganization()
  const router = useRouter()
  const [hasRequested, setHasRequested] = useState(false)
  const token = process.env.NEXT_PUBLIC_COMMUNITY_JOIN_TOKEN as string
  const getOrganization = useGetOrganizationByToken(token as string)
  const joinOrganization = useJoinOrganization()

  useEffect(() => {
    if (getCurrentOrganization.data) {
      router.push(`/${COMMUNITY_SLUG}`)
    }
  }, [getCurrentOrganization.data, router])

  async function handleJoin() {
    const scope = getOrganization.data?.slug

    if (!scope) return

    await joinOrganization.mutate(
      { token, scope },
      {
        onSuccess: () => {
          toast('Request sent')
          setHasRequested(true)
        },
        onError: (error) => {
          apiErrorToast(error)
          setHasRequested(false)
        }
      }
    )
  }

  if (getCurrentOrganization.isLoading || getCurrentOrganization.data) {
    return <FullPageLoading />
  }

  // for some reason getting the org via token didn't work
  if (!getOrganization.data) {
    return (
      <FullPageError
        emoji='🚧'
        title='Under maintenance'
        message='The community is currently under maintenance — check back later'
      />
    )
  }

  return (
    <div className='flex h-full flex-1 flex-col'>
      <BasicTitlebar />
      <ScrollableContainer className='bg-primary flex h-screen w-full flex-col'>
        <div className='mx-auto flex w-full max-w-2xl flex-1 select-text flex-col gap-16 px-4 py-32'>
          <div className='flex flex-col gap-6'>
            <div className='prose'>
              <p className='text-3xl'>🏕️</p>
              <p>Welcome to the Campsite Community!</p>
              <p>
                This is a semi-private channel for designers to share work-in-progress, get feedback, and connect with
                others.
              </p>
            </div>
            <div>
              <Button onClick={handleJoin} disabled={hasRequested} variant='important'>
                {hasRequested ? 'Request sent' : 'Request to join'}
              </Button>
            </div>
            <div className='flex flex-col gap-2'>
              <UIText tertiary>You’ll receive an email when your request is approved.</UIText>
              <UIText tertiary>
                To be approved faster, please add your profile photo and real name to your Campsite account.
              </UIText>
              <UIText tertiary>
                <Link href='/me/settings' className='text-blue-500'>
                  Update my profile
                </Link>
              </UIText>
            </div>
          </div>

          <div className='bg-secondary flex flex-col gap-6 rounded-xl border p-6 shadow-sm'>
            <div className='prose'>
              <p>
                Campsite is also a tool for teams. Hundreds of companies use Campsite every day to share
                work-in-progress, organize async feedback, and keep track of projects.
              </p>
              <p>Feel free to explore Campsite while waiting for your community membership to be approved.</p>
            </div>
            <div className='flex items-center gap-2'>
              <Button href='/new' variant='primary'>
                Explore Campsite
              </Button>
              <Button href='https://campsite.com' externalLink variant='flat'>
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </ScrollableContainer>
    </div>
  )
}
