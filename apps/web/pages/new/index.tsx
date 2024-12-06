import Head from 'next/head'
import Router, { useRouter } from 'next/router'

import { OrganizationInvitation, SuggestedOrganization } from '@campsite/types/generated'
import { Avatar, Button, Logo, UIText } from '@campsite/ui'

import { BackButton } from '@/components/BackButton'
import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { NewOrganizationForm } from '@/components/NewOrganizationForm'
import { Container, Form, Title } from '@/components/OrgOnboarding/Components'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { BasicTitlebar } from '@/components/Titlebar'
import { useAcceptOrganizationInvitation } from '@/hooks/useAcceptOrganizationInvitation'
import { useCreateVerifiedDomainMembership } from '@/hooks/useCreateVerifiedDomainMembership'
import { useDeclineOrganizationInvitation } from '@/hooks/useDeclineOrganizationInvitation'
import { useGetCurrentUserOrganizationInvitations } from '@/hooks/useGetCurrentUserOrganizationInvitations'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { useGetSuggestedOrganizations } from '@/hooks/useGetSuggestedOrganizations'
import { useSignoutUser } from '@/hooks/useSignoutUser'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { PageWithProviders } from '@/utils/types'

const DashboardPage: PageWithProviders<any> = () => {
  const { data: memberships } = useGetOrganizationMemberships()
  const hasOrganizations = memberships && memberships.length > 0
  const leadingSlot = hasOrganizations ? <BackButton /> : <Logo />
  const signout = useSignoutUser()

  const { data: suggestedOrganizations, isLoading: isLoadingSuggestedOrganizations } = useGetSuggestedOrganizations()
  const hasNoSuggestedOrganizations = suggestedOrganizations?.length === 0

  const { data: organizationInvitations, isLoading: isLoadingOrganizationInvitations } =
    useGetCurrentUserOrganizationInvitations()
  const hasNoOrganizationInvitations = organizationInvitations?.length === 0

  const showCreateOrganizationRoute = !!useRouter().query.create
  const isLoading =
    !showCreateOrganizationRoute && (isLoadingSuggestedOrganizations || isLoadingOrganizationInvitations)
  const showCreateOrganization =
    showCreateOrganizationRoute || (hasNoOrganizationInvitations && hasNoSuggestedOrganizations)

  return (
    <>
      <CopyCurrentUrl />

      <Head>
        <title>Welcome to Campsite</title>
      </Head>

      <main className='flex h-full flex-col overflow-hidden'>
        <BasicTitlebar
          leadingSlot={leadingSlot}
          trailingSlot={
            <Button variant='plain' onClick={() => signout.mutate()}>
              Log out
            </Button>
          }
          disableBottomBorder
        />

        <Container>
          {!isLoading &&
            (showCreateOrganization ? (
              <NewOrganizationForm />
            ) : (
              <PendingOrganizations suggested={suggestedOrganizations} invites={organizationInvitations} />
            ))}
        </Container>
      </main>
    </>
  )
}

function PendingOrganizations({
  suggested,
  invites
}: {
  suggested: SuggestedOrganization[] | undefined
  invites: OrganizationInvitation[] | undefined
}) {
  return (
    <>
      <Title title='Join or create an organization' subtitle='You have access to the following organizations.' />
      <Form>
        {invites?.map((invite) => <InviteRow key={invite.id} invite={invite} />)}
        {suggested?.map((suggestion) => <SuggestedRow key={suggestion.id} suggestion={suggestion} />)}

        <div className='flex items-center gap-4'>
          <div className='h-px flex-1 border-b' />
          <UIText tertiary>or</UIText>
          <div className='h-px flex-1 border-b' />
        </div>

        <Button variant='flat' size='large' href={`/new?create=true`}>
          Create new organization
        </Button>
      </Form>
    </>
  )
}

function InviteRow({ invite }: { invite: OrganizationInvitation }) {
  const acceptInvite = useAcceptOrganizationInvitation()
  const declineInvite = useDeclineOrganizationInvitation()

  const { organization, token } = invite

  if (!organization || !token) return null

  const isPending = acceptInvite.isPending || declineInvite.isPending

  return (
    <div className='flex flex-row justify-between gap-2'>
      <div className='flex items-center gap-3'>
        <Avatar size='lg' name={organization.name} urls={organization.avatar_urls} rounded='rounded' />
        <div className='flex flex-1 flex-col'>
          <UIText weight='font-medium'>{organization.name}</UIText>
          <UIText tertiary>You were invited</UIText>
        </div>
      </div>

      <div className='flex items-center space-x-2 sm:w-auto'>
        <Button
          variant='plain'
          onClick={() => declineInvite.mutate({ id: invite.id, slug: organization.slug })}
          disabled={isPending}
        >
          Dismiss
        </Button>
        <Button
          variant='primary'
          onClick={() => acceptInvite.mutate({ token }, { onError: apiErrorToast })}
          disabled={isPending}
        >
          Join
        </Button>
      </div>
    </div>
  )
}

function SuggestedRow({ suggestion }: { suggestion: SuggestedOrganization }) {
  const join = useCreateVerifiedDomainMembership()

  return (
    <div className='flex flex-row justify-between gap-2'>
      <div className='flex items-center gap-3'>
        <Avatar size='lg' name={suggestion.name} urls={suggestion.avatar_urls} rounded='rounded' />
        <div className='flex flex-1 flex-col'>
          <UIText weight='font-medium'>{suggestion.name}</UIText>
          <UIText tertiary>Based on your email</UIText>
        </div>
      </div>

      <div className='flex items-center space-x-2 sm:w-auto'>
        {suggestion.requested ? (
          <Button variant='flat' tooltip='An admin will review your request' disabled>
            Requested
          </Button>
        ) : (
          <Button
            variant='primary'
            onClick={() =>
              join.mutate({ slug: suggestion.slug }, { onSuccess: (_, { slug }) => Router.push(`/${slug}`) })
            }
            disabled={join.isPending}
          >
            Join
          </Button>
        )}
      </div>
    </div>
  )
}

DashboardPage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default DashboardPage
