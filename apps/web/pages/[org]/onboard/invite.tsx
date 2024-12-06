import { useState } from 'react'
import Router, { useRouter } from 'next/router'

import { Button, MailIcon, TextField } from '@campsite/ui'

import { Container, HeadOrgName, OrgAvatar, Title } from '@/components/OrgOnboarding/Components'
import { OrganizationInviteLinkField } from '@/components/People/OrganizationInviteLinkField'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { BasicTitlebar } from '@/components/Titlebar'
import { useScope } from '@/contexts/scope'
import { useBulkInviteOrganizationMembers } from '@/hooks/useBulkInviteOrganizationMembers'
import { useGetProject } from '@/hooks/useGetProject'
import { useSignoutUser } from '@/hooks/useSignoutUser'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { PageWithLayout } from '@/utils/types'

const OnboardInvitePage: PageWithLayout<any> = () => {
  const { scope } = useScope()
  const signout = useSignoutUser()
  const [showEmailInvites, setShowEmailInvites] = useState(false)
  const [commaSeparatedEmails, setCommaSeparatedEmails] = useState('')
  const bulkInviteOrganizationMembers = useBulkInviteOrganizationMembers()
  const createdProjectId = useRouter().query.projectId as string | undefined
  const createdProject = useGetProject({ id: createdProjectId })

  const nextPage = createdProjectId ? `/${scope}/projects/${createdProjectId}` : `/${scope}`
  const title = createdProjectId
    ? `Who else is working on ${createdProject?.data?.name ?? 'this project'}?`
    : 'Who else is working with you?'

  return (
    <>
      <HeadOrgName />

      <main className='flex h-full w-full flex-col'>
        <BasicTitlebar
          leadingSlot={null}
          trailingSlot={
            <Button variant='plain' onClick={() => signout.mutate()}>
              Log out
            </Button>
          }
          disableBottomBorder
        />

        <Container>
          <OrgAvatar />
          <Title
            title={title}
            subtitle='Share this link to invite anyone to work on this project with you. You can also invite people by email.'
          />
          <OrganizationInviteLinkField onboarding />

          <div className='flex flex-col gap-2'>
            {showEmailInvites ? (
              <TextField
                value={commaSeparatedEmails}
                onChange={setCommaSeparatedEmails}
                placeholder='person@company.com, person@company.com'
                minRows={3}
                autoFocus
                multiline
              />
            ) : (
              <Button variant='flat' leftSlot={<MailIcon />} onClick={() => setShowEmailInvites(true)}>
                Invite with email
              </Button>
            )}
          </div>

          <Button
            variant='primary'
            size='large'
            className='mt-6'
            disabled={bulkInviteOrganizationMembers.isPending || bulkInviteOrganizationMembers.isSuccess}
            href={commaSeparatedEmails.length ? undefined : nextPage}
            onClick={
              commaSeparatedEmails.length
                ? () => {
                    bulkInviteOrganizationMembers.mutate(
                      { comma_separated_emails: commaSeparatedEmails, project_id: createdProjectId },
                      {
                        onSuccess: () => Router.push(nextPage),
                        onError: apiErrorToast
                      }
                    )
                  }
                : undefined
            }
          >
            {showEmailInvites ? 'Send & continue' : 'Continue'}
          </Button>
        </Container>
      </main>
    </>
  )
}

OnboardInvitePage.getProviders = (page, pageProps) => {
  return <AuthAppProviders {...pageProps}>{page}</AuthAppProviders>
}

export default OnboardInvitePage
