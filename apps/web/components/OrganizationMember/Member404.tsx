import { Button } from '@campsite/ui'

import { EmptyState } from '@/components/EmptyState'
import { useScope } from '@/contexts/scope'

export function OrganizationMember404() {
  const { scope } = useScope()

  return (
    <EmptyState title='Person not found' emoji={null}>
      <div className='flex items-center justify-center p-3'>
        <Button variant='primary' href={`/${scope}/people`}>
          Back to people
        </Button>
      </div>
    </EmptyState>
  )
}
