import { useState } from 'react'
import Head from 'next/head'
import Router, { useRouter } from 'next/router'
import { useMutation, useQuery } from '@tanstack/react-query'

import { OrganizationInvitation, SuggestedOrganization } from '@campsite/types/generated'
import { Avatar, Button, LoadingSpinner, Logo, TextField, UIText } from '@campsite/ui'

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

  return (
    <>
      <CopyCurrentUrl />

      <Head>
        <title>Join an organization · Campsite</title>
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
          {showCreateOrganizationRoute ? (
            <NewOrganizationForm />
          ) : !isLoading ? (
            <JoinOrganization
              suggested={suggestedOrganizations}
              invites={organizationInvitations}
              hasNoInvites={hasNoOrganizationInvitations}
              hasNoSuggested={hasNoSuggestedOrganizations}
            />
          ) : null}
        </Container>
      </main>
    </>
  )
}

function JoinOrganization({
  suggested,
  invites,
  hasNoInvites,
  hasNoSuggested
}: {
  suggested: SuggestedOrganization[] | undefined
  invites: OrganizationInvitation[] | undefined
  hasNoInvites: boolean
  hasNoSuggested: boolean
}) {
  return (
    <>
      <Title
        title='Join an organization'
        subtitle={
          hasNoInvites && hasNoSuggested
            ? 'Enter the Org ID shared by your team to join their organization.'
            : 'You have pending invitations, or enter an Org ID to join.'
        }
      />
      <Form>
        {invites?.map((invite) => <InviteRow key={invite.id} invite={invite} />)}
        {suggested?.map((suggestion) => <SuggestedRow key={suggestion.id} suggestion={suggestion} />)}

        {(!hasNoInvites || !hasNoSuggested) && (
          <div className='flex items-center gap-4'>
            <div className='h-px flex-1 border-b' />
            <UIText tertiary>or join by Org ID</UIText>
            <div className='h-px flex-1 border-b' />
          </div>
        )}

        <JoinByOrgId />
      </Form>
    </>
  )
}

function JoinByOrgId() {
  const [orgId, setOrgId] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Look up org only when full 12-char ID is entered
  const { data: orgPreview, isFetching } = useQuery({
    queryKey: ['org-preview', orgId],
    queryFn: async () => {
      const res = await fetch(`/v1/organizations/lookup?org_id=${encodeURIComponent(orgId)}`)

      if (!res.ok) return null

      return res.json()
    },
    enabled: orgId.length === 12
  })

  // Join mutation
  const joinMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/v1/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: id })
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: 'Failed to join organization' }))

        throw new Error(body.message)
      }

      return res.json()
    },
    onSuccess: (data) => {
      Router.push(data.redirect_path || '/')
    },
    onError: (err: Error) => {
      setError(err.message)
    }
  })

  return (
    <div className='flex flex-col gap-3'>
      <TextField
        id='org-id'
        name='org-id'
        label='Org ID'
        labelHidden
        placeholder='Enter Org ID'
        value={orgId}
        onChange={(value) => {
          setOrgId(value)
          setError(null)
        }}
      />

      {error && <UIText className='text-red-500 text-sm'>{error}</UIText>}

      {isFetching && orgId.length === 12 && !orgPreview && (
        <div className='flex items-center justify-center py-3'>
          <LoadingSpinner />
        </div>
      )}

      {orgPreview && (
        <div className='bg-elevated flex items-center gap-3 rounded-lg border p-3'>
          <Avatar size='lg' name={orgPreview.name} urls={orgPreview.avatar_urls} rounded='rounded' />
          <div className='flex flex-1 flex-col'>
            <UIText weight='font-medium'>{orgPreview.name}</UIText>
            <UIText tertiary className='text-xs'>{orgPreview.slug}</UIText>
          </div>
          <Button
            variant='primary'
            onClick={() => joinMutation.mutate(orgId)}
            disabled={joinMutation.isPending}
          >
            {joinMutation.isPending ? 'Joining...' : 'Join'}
          </Button>
        </div>
      )}

      {!orgPreview && !isFetching && orgId.length === 12 && (
        <UIText tertiary className='text-sm'>No organization found with that ID.</UIText>
      )}
    </div>
  )
}

function InviteRow({ invite }: { invite: OrganizationInvitation }) {
  const acceptInvite = useAcceptOrganizationInvitation()
  const declineInvite = useDeclineOrganizationInvitation()

  const { organization, token } = invite

  if (!organization || !token) return null

  const isPending = acceptInvite.isPending || declineInvite.isPending

  return (
    <div className='bg-elevated flex items-center justify-between gap-3 rounded-lg border p-3'>
      <div className='flex items-center gap-3'>
        <Avatar size='lg' name={organization.name} urls={organization.avatar_urls} rounded='rounded' />
        <div className='flex flex-1 flex-col'>
          <UIText weight='font-medium'>{organization.name}</UIText>
          <UIText tertiary className='text-xs'>You were invited</UIText>
        </div>
      </div>

      <div className='flex items-center gap-2'>
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
    <div className='bg-elevated flex items-center justify-between gap-3 rounded-lg border p-3'>
      <div className='flex items-center gap-3'>
        <Avatar size='lg' name={suggestion.name} urls={suggestion.avatar_urls} rounded='rounded' />
        <div className='flex flex-1 flex-col'>
          <UIText weight='font-medium'>{suggestion.name}</UIText>
          <UIText tertiary className='text-xs'>Based on your email</UIText>
        </div>
      </div>

      <div className='flex items-center gap-2'>
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
