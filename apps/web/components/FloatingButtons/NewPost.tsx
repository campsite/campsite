import { useState } from 'react'
import { isMobile } from 'react-device-detect'

import { Button, cn, PlusIcon, PostIcon } from '@campsite/ui'

import { PostComposerSuccessBehavior, usePostComposer } from '@/components/PostComposer'
import { ViewerUpsellDialog } from '@/components/Upsell/ViewerUpsellDialog'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

export function FloatingNewPostButton() {
  const { showPostComposer } = usePostComposer()
  const { data: currentOrganization } = useGetCurrentOrganization()
  const [showViewerUpsellDialog, setShowViewerUpsellDialog] = useState(false)

  return (
    <div
      className={cn('fixed bottom-16 right-4 z-20 lg:hidden', {
        'mb-safe-offset-2': isMobile
      })}
    >
      <Button
        className='dark:bg-elevated bg-black text-white shadow-md hover:bg-gray-800 dark:shadow-[inset_0px_1px_0px_rgb(255_255_255_/_0.04),_inset_0px_0px_0px_1px_rgb(255_255_255_/_0.02),_0px_1px_2px_rgb(0_0_0_/_0.4),_0px_2px_4px_rgb(0_0_0_/_0.08),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24)] dark:hover:bg-gray-800'
        variant='plain'
        round
        leftSlot={<PlusIcon />}
        size='large'
        onClick={() =>
          currentOrganization?.viewer_can_post
            ? showPostComposer({ successBehavior: PostComposerSuccessBehavior.Redirect })
            : setShowViewerUpsellDialog(true)
        }
      >
        New post
      </Button>
      {!currentOrganization?.viewer_can_post && (
        <ViewerUpsellDialog
          open={showViewerUpsellDialog}
          onOpenChange={setShowViewerUpsellDialog}
          icon={<PostIcon size={28} />}
          title='Posting is available to members'
        />
      )}
    </div>
  )
}
