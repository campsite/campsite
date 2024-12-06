import { os } from '@todesktop/client-core/platform'
import Head from 'next/head'

import { Body, Button, LockIcon, Title1, UIText } from '@campsite/ui'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'

import { BasicTitlebar } from '@/components/Titlebar'
import { useScope } from '@/contexts/scope'
import { reauthorizeSSOUrl } from '@/utils/queryClient'

const SingleSignOn: React.FC = () => {
  const { scope } = useScope()
  const isDesktop = useIsDesktopApp()

  const handleClick = () => {
    const from = window.location.href

    const href = reauthorizeSSOUrl({ orgSlug: scope as string, from, desktop: isDesktop })

    if (isDesktop) {
      os.openURL(href)
    } else {
      window.location.href = href
    }
  }

  return (
    <>
      <Head>
        <title>Single sign-on to {scope}</title>
      </Head>

      <div className='flex flex-1 flex-col'>
        <BasicTitlebar centerSlot={<UIText weight='font-semibold'>Single sign-on</UIText>} />

        <main id='main' className='no-drag relative flex h-screen w-full flex-col overflow-y-auto'>
          <div className='flex flex-1 flex-col items-center justify-center gap-6'>
            <LockIcon size={48} />
            <div className='flex w-full max-w-md flex-col items-center rounded-md text-center'>
              <Title1>Single sign-on to continue</Title1>

              <Body className='mt-4' secondary>
                This organization requires your account to be authenticated using single sign-on.
              </Body>

              <div className='mt-6 space-y-6'>
                <Button fullWidth onClick={handleClick}>
                  Continue with SSO
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default SingleSignOn
