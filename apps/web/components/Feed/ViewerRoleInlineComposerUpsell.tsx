import { useState } from 'react'

import { Avatar, Button, PostIcon, UIText } from '@campsite/ui'

import { ViewerUpsellDialog } from '@/components/Upsell/ViewerUpsellDialog'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

export function ViewerRoleInlineComposerUpsell() {
  const [showViewerUpsellDialog, setShowViewerUpsellDialog] = useState(false)
  const { data: currentUser } = useGetCurrentUser()

  return (
    <>
      <div className='px-4 py-4 md:pt-6 lg:px-0 lg:pt-8'>
        <button onClick={() => setShowViewerUpsellDialog(true)} className='flex w-full items-start gap-3'>
          <Avatar urls={currentUser?.avatar_urls} name={currentUser?.display_name} size='lg' />
          <div className='bg-tertiary ring-gray-150 flex h-11 w-full items-center justify-between rounded-lg py-2.5 pl-3 pr-2 ring-1 dark:ring-gray-800'>
            <UIText tertiary className='text-[15px]'>
              What are you working on?
            </UIText>
            <Button variant='primary' disabled className='pointer-events-none'>
              Post
            </Button>
          </div>
        </button>
      </div>
      <ViewerUpsellDialog
        open={showViewerUpsellDialog}
        onOpenChange={setShowViewerUpsellDialog}
        icon={<PostIcon size={28} />}
        title='Posting is available to members'
      />
    </>
  )
}
