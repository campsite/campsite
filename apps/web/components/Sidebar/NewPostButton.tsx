import { useState } from 'react'
import { useRouter } from 'next/router'

import { Button } from '@campsite/ui/Button'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { PostIcon } from '@campsite/ui/Icons'

import { usePostComposer, usePostComposerHasLocalDraft, usePostComposerIsOpen } from '@/components/PostComposer'
import { ViewerUpsellDialog } from '@/components/Upsell/ViewerUpsellDialog'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

export function NewPostButton() {
  const router = useRouter()
  const { showPostComposer } = usePostComposer()
  const { isPostComposerOpen } = usePostComposerIsOpen()
  const { hasLocalDraft } = usePostComposerHasLocalDraft()
  const { data: currentOrganization } = useGetCurrentOrganization()
  const [showViewerUpsellDialog, setShowViewerUpsellDialog] = useState(false)

  const canPost = currentOrganization?.viewer_can_post
  const showDraftHint = hasLocalDraft && !isPostComposerOpen
  const isViewingChatThread = router.pathname === '/[org]/chat/[threadId]'

  const composerKeyboardToggle = () => {
    if (isViewingChatThread) return
    if (!canPost) return setShowViewerUpsellDialog(true)

    openComposer()
  }

  const openComposer = () => {
    showPostComposer()
  }

  return (
    <>
      <LayeredHotkeys keys='c' callback={composerKeyboardToggle} options={{ preventDefault: true }} />

      <div className='relative isolate'>
        <Button
          tooltip={showDraftHint ? 'Resume post' : 'New post'}
          tooltipShortcut='c'
          onClick={() => (canPost ? openComposer() : setShowViewerUpsellDialog(true))}
          fullWidth
          variant='base'
        >
          {showDraftHint ? 'Resume post' : 'New post'}
        </Button>
      </div>

      {!canPost && (
        <ViewerUpsellDialog
          open={showViewerUpsellDialog}
          onOpenChange={setShowViewerUpsellDialog}
          icon={<PostIcon size={28} />}
          title='Posting is available to members'
        />
      )}
    </>
  )
}
