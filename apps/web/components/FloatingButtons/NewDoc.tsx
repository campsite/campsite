import { useState } from 'react'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

import { Button, cn, LoadingSpinner, PlusIcon } from '@campsite/ui'

import { ViewerRoleCreateNoteUpsell } from '@/components/NotesIndex/ViewerRoleCreateNoteUpsell'
import { useCreateNewNote } from '@/hooks/useCreateNote'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

export function FloatingNewDocButton() {
  const { data: currentOrganization } = useGetCurrentOrganization()
  const [showViewerUpsellDialog, setShowViewerUpsellDialog] = useState(false)
  const { handleCreate, isPending } = useCreateNewNote()
  const router = useRouter()
  const project_id = router.query.projectId as string | undefined

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
        leftSlot={isPending ? <LoadingSpinner /> : <PlusIcon />}
        size='large'
        onClick={() =>
          currentOrganization?.viewer_can_post
            ? handleCreate(project_id ? { project_id } : undefined)
            : setShowViewerUpsellDialog(true)
        }
      >
        New doc
      </Button>
      {!currentOrganization?.viewer_can_post && (
        <ViewerRoleCreateNoteUpsell open={showViewerUpsellDialog} onOpenChange={setShowViewerUpsellDialog} />
      )}
    </div>
  )
}
