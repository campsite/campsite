import { Button, TagIcon } from '@campsite/ui'

import { EmptyState } from '@/components/EmptyState'
import { useScope } from '@/contexts/scope'

export function Tag404() {
  const { scope } = useScope()

  return (
    <EmptyState title='Tag not found' icon={<TagIcon size={40} className='text-tertiary' />}>
      <div className='flex items-center justify-center p-3'>
        <Button variant='flat' href={`/${scope}/tags`}>
          Back to tags
        </Button>
      </div>
    </EmptyState>
  )
}
