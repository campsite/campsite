import { Button, ProjectIcon } from '@campsite/ui'

import { EmptyState } from '@/components/EmptyState'
import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

export function Project404() {
  const { scope } = useScope()
  const { data: organization } = useGetCurrentOrganization()

  return (
    <EmptyState title='Channel not found' icon={<ProjectIcon size={40} className='text-tertiary' />}>
      <div className='flex items-center justify-center p-3'>
        {organization?.viewer_can_see_projects_index ? (
          <Button variant='flat' href={`/${scope}/projects`}>
            Back to channel
          </Button>
        ) : (
          <Button variant='flat' href={`/${scope}`}>
            Back home
          </Button>
        )}
      </div>
    </EmptyState>
  )
}
