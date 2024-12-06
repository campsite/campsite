import React from 'react'
import Head from 'next/head'

import { Body, Button, Logo, Title2 } from '@campsite/ui'
import { ToasterProvider } from '@campsite/ui/Toast'

import { FullPageError } from '@/components/Error'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useSendEmailConfirmation } from '@/hooks/useSendEmailConfirmation'
import { useSignoutUser } from '@/hooks/useSignoutUser'

import { FullPageLoading } from './FullPageLoading'

interface Props {
  children: React.ReactNode
  allowLoggedOut: boolean
}

const ConfirmEmailGuard: React.FC<Props> = ({ children, allowLoggedOut }) => {
  const getCurrentUser = useGetCurrentUser()
  const sendEmail = useSendEmailConfirmation()
  const signout = useSignoutUser()
  const currentUser = getCurrentUser.data

  if (allowLoggedOut) {
    return <>{children}</>
  }

  if (getCurrentUser.error) {
    return <FullPageError message='We ran into an issue starting the app' />
  }

  if (!getCurrentUser.data && getCurrentUser.isLoading) {
    return <FullPageLoading />
  }

  if (currentUser && !currentUser.email_confirmed) {
    return (
      <>
        <Head>
          <title>Confirm your email</title>
        </Head>

        <ToasterProvider />

        <div className='bg-secondary flex flex-1 flex-col items-center justify-center gap-8 p-4'>
          <Logo />
          <div className='flex w-full max-w-md flex-col rounded-md text-center'>
            <Title2>Confirm your email</Title2>

            <Body className='mt-4' secondary>
              We sent an email to{' '}
              <Body element='span' className='font-semibold' primary>
                {currentUser.unconfirmed_email || currentUser.email}
              </Body>
              . Click the link in the email to confirm your account.
            </Body>

            <div className='mt-6 space-y-6'>
              <Button disabled={sendEmail.isPending} fullWidth onClick={() => sendEmail.mutate()}>
                Resend email
              </Button>
              <Button fullWidth variant='plain' onClick={() => signout.mutate()}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}

export default ConfirmEmailGuard
