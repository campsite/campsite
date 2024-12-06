import { OauthApplication } from '@campsite/types'
import { Avatar, ChevronRightIcon, Link, UIText } from '@campsite/ui'

import { FullPageLoading } from '@/components/FullPageLoading'
import { useScope } from '@/contexts/scope'
import { useGetOauthApplications } from '@/hooks/useGetOauthApplications'

export function OauthAppsTable() {
  const { data: oauthApplications, isFetching } = useGetOauthApplications()

  return (
    <div className='flex flex-col'>
      {oauthApplications && oauthApplications.length > 0 ? (
        <div className=''>
          {oauthApplications.map((oauthApplication) => (
            <OauthAppRow key={oauthApplication.id} oauthApplication={oauthApplication} />
          ))}
        </div>
      ) : isFetching && !oauthApplications ? (
        <div className='p-4'>
          <FullPageLoading />
        </div>
      ) : null}
    </div>
  )
}

function OauthAppRow({ oauthApplication }: { oauthApplication: OauthApplication }) {
  const { scope } = useScope()

  return (
    <Link href={`/${scope}/settings/integrations/${oauthApplication.id}`} className='block border-t first:border-0'>
      <div className='gap-3 p-3'>
        <div className='flex items-center gap-3'>
          <div className='flex flex-1 flex-row items-center gap-2.5'>
            <Avatar src={oauthApplication.avatar_url} alt={oauthApplication.name} size='base' rounded='rounded-md' />
            <UIText weight='font-medium' className='truncate'>
              {oauthApplication.name}
            </UIText>
          </div>

          <div className='flex gap-1'>
            <ChevronRightIcon />
          </div>
        </div>
      </div>
    </Link>
  )
}
