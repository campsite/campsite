import { useRouter } from 'next/router'

import { Avatar, UIText } from '@campsite/ui'

import { BasicTitlebar } from '@/components/Titlebar'
import { SubnavigationTab } from '@/components/Titlebar/Subnavigation'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

import { ScrollableContainer } from '../ScrollableContainer'

interface Props {
  children: React.ReactNode
}

export function UserSettingsPageWrapper(props: Props) {
  const { children } = props
  const router = useRouter()
  const { data: currentUser } = useGetCurrentUser()

  return (
    <>
      <div className='bg-primary sticky top-0 z-10'>
        <BasicTitlebar
          className='-mb-2 border-b-0'
          centerSlot={
            <div className='flex items-center gap-3'>
              <Avatar urls={currentUser?.avatar_urls} name={currentUser?.display_name} size='sm' />
              <UIText weight='font-semibold'>Account settings</UIText>
            </div>
          }
        />

        <div className='flex w-full border-b px-4 lg:px-0'>
          <div className='mx-auto flex w-full max-w-3xl items-center justify-center gap-4'>
            <SubnavigationTab href='/me/settings' active={router.pathname === '/me/settings'} replace>
              General
            </SubnavigationTab>
            <SubnavigationTab
              replace
              href='/me/settings/organizations'
              active={router.pathname === '/me/settings/organizations'}
            >
              Organizations
            </SubnavigationTab>
          </div>
        </div>
      </div>

      <ScrollableContainer className='no-drag relative'>
        <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-32 pt-8 lg:px-0'>{children}</div>
      </ScrollableContainer>
    </>
  )
}
