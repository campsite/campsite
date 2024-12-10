import { useRouter } from 'next/router'

import { Avatar, Link, UIText } from '@campsite/ui'

import { BackButton } from '@/components/BackButton'
import { BasicTitlebar } from '@/components/Titlebar'
import { SubnavigationTab } from '@/components/Titlebar/Subnavigation'
import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useViewerCanCreateCustomReaction } from '@/hooks/useViewerCanCreateCustomReaction'
import { useViewerCanManageIntegrations } from '@/hooks/useViewerCanManageIntegrations'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

interface Props {
  children: React.ReactNode
  backPath?: string
}

export function OrgSettingsPageWrapper(props: Props) {
  const { children } = props
  const router = useRouter()
  const { scope } = useScope()
  const { data: currentOrganization } = useGetCurrentOrganization()
  const isCommunity = useIsCommunity()
  const viewerIsAdmin = useViewerIsAdmin()
  const { viewerCanCreateCustomReaction } = useViewerCanCreateCustomReaction()
  const { viewerCanManageIntegrations } = useViewerCanManageIntegrations()

  if (isCommunity && !viewerIsAdmin) return null

  return (
    <>
      <div className='bg-primary sticky top-0 z-10'>
        <BasicTitlebar
          leadingSlot={<BackButton fallbackPath={props.backPath ?? `/${scope}`} />}
          className='-mb-2 border-b-0'
          centerSlot={
            <Link className='flex items-center gap-3' href={`/${scope}`}>
              <Avatar
                rounded='rounded'
                urls={currentOrganization?.avatar_urls}
                name={currentOrganization?.name}
                size='sm'
              />
              <UIText weight='font-semibold'>{currentOrganization?.name} settings</UIText>
            </Link>
          }
        />

        {(viewerIsAdmin || viewerCanCreateCustomReaction) && (
          // If custom reactions are disabled, then there's only 1 tab to show (People) so we hide the entire navigation header
          <div className='flex w-full border-b px-4 lg:px-0'>
            <div className='mx-auto flex w-full max-w-3xl items-center justify-center gap-4'>
              {viewerIsAdmin && (
                <SubnavigationTab href={`/${scope}/settings`} active={router.pathname === '/[org]/settings'} replace>
                  General
                </SubnavigationTab>
              )}
              {viewerCanCreateCustomReaction && (
                <SubnavigationTab
                  href={`/${scope}/settings/emojis`}
                  active={router.pathname.startsWith('/[org]/settings/emojis')}
                  replace
                >
                  Emojis
                </SubnavigationTab>
              )}
              {viewerCanManageIntegrations && (
                <>
                  <SubnavigationTab
                    href={`/${scope}/settings/integrations`}
                    active={router.pathname.startsWith('/[org]/settings/integrations')}
                    replace
                  >
                    Integrations
                  </SubnavigationTab>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <main id='main' className='no-drag relative flex flex-1 flex-col overflow-y-auto'>
        <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-32 pt-8 lg:px-0'>{children}</div>
      </main>
    </>
  )
}
