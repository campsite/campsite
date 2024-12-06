import { useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useAtom, useSetAtom } from 'jotai'
import Router from 'next/router'
import { toast } from 'react-hot-toast'

import { Post } from '@campsite/types'
import { cn, Dialog, PostIcon, UIText } from '@campsite/ui'

import { setFeedbackDialogOpenAtom, setFeedbackDialogValueAtom } from '@/components/Feedback/FeedbackDialog'
import { usePostComposerPresentation } from '@/components/PostComposer/hooks/usePostComposerPresentation'
import { PostComposerDeleteDraftPostDialog } from '@/components/PostComposer/PostComposerDeleteDraftPostDialog'
import { PostComposerDiscardDialog } from '@/components/PostComposer/PostComposerDiscardDialog'
import { PostComposerHeaderActions } from '@/components/PostComposer/PostComposerHeaderActions'
import { PostComposerNewDraftToast } from '@/components/PostComposer/PostComposerNewDraftToast'
import { PostComposerNewPostToast } from '@/components/PostComposer/PostComposerNewPostToast'
import { PostComposerSyncDraftToLocalStorage } from '@/components/PostComposer/PostComposerSyncDraftToLocalStorage'
import { PostComposerSyncLastUsedProject } from '@/components/PostComposer/PostComposerSyncLastUsedProject'
import {
  getIsPostComposerExpandedDefaultValue,
  isPostComposerExpandedAtomFamily,
  PostComposerPresentation,
  postComposerStateAtom,
  PostComposerSuccessBehavior,
  PostComposerType
} from '@/components/PostComposer/utils'
import { ViewerUpsellDialog } from '@/components/Upsell/ViewerUpsellDialog'
import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

import { InlineComposerRef, PostComposerForm, PostComposerFormProvider } from './PostComposerForm'

const VISUALLY_HIDDEN_TITLE = 'Create a new post'
const VISUALLY_HIDDEN_DESCRIPTION = 'What would you like to share?'

export function PostComposer() {
  const { scope } = useScope()
  const ref = useRef<InlineComposerRef>(null)

  const [postComposerState, setPostComposerState] = useAtom(postComposerStateAtom)
  const { postComposerPresentation } = usePostComposerPresentation()
  const [isPostComposerExpanded, setIsPostComposerExpanded] = useAtom(
    isPostComposerExpandedAtomFamily(postComposerPresentation)
  )
  const { data: currentOrganization } = useGetCurrentOrganization()

  const open = !!postComposerState
  const showComposerDialog = open && postComposerPresentation === PostComposerPresentation.Dialog
  const showComposerMole = open && postComposerPresentation === PostComposerPresentation.Mole

  const setFeedbackDialogOpen = useSetAtom(setFeedbackDialogOpenAtom)
  const setFeedbackDialogValue = useSetAtom(setFeedbackDialogValueAtom)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showDeleteDraftDialog, setShowDeleteDraftDialog] = useState(false)

  function handleCloseDialog() {
    setShowDeleteDraftDialog(false)
    setShowDiscardDialog(false)
    setPostComposerState(undefined)
    setIsPostComposerExpanded(getIsPostComposerExpandedDefaultValue(postComposerPresentation))
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      return
    } else if (postComposerState?.type !== PostComposerType.Draft && ref.current?.isDirty) {
      setShowDiscardDialog(true)
    } else {
      handleCloseDialog()
    }
  }

  function handleReportBug(text: string = '') {
    handleCloseDialog()
    setFeedbackDialogOpen(true)
    setFeedbackDialogValue(text)
  }

  function handleDeleteDraftDialog() {
    setShowDeleteDraftDialog(true)
  }

  function handleSubmit(
    data: { type: 'new-post'; post: Post } | { type: 'update-post' } | { type: 'draft-post'; post: Post }
  ) {
    handleCloseDialog()

    if (data.type === 'new-post') {
      switch (postComposerState?.successBehavior) {
        case PostComposerSuccessBehavior.Redirect:
          Router.push(`/${data.post.organization.slug}/posts/${data.post.id}`)
          break
        case PostComposerSuccessBehavior.Toast:
        default:
          toast(<PostComposerNewPostToast post={data.post} />, { duration: 5000 })
      }
    } else if (data.type === 'draft-post') {
      switch (postComposerState?.successBehavior) {
        case PostComposerSuccessBehavior.Redirect:
          Router.push(`/${scope}/drafts`)
          break
        case PostComposerSuccessBehavior.Toast:
        default:
          toast(<PostComposerNewDraftToast />, { duration: 5000 })
      }
    }
  }

  if (!open) return null

  if (!currentOrganization?.viewer_can_post) {
    return (
      <ViewerUpsellDialog
        open={open}
        onOpenChange={handleOpenChange}
        icon={<PostIcon size={28} />}
        title='Posting is available to members'
      />
    )
  }

  return (
    <PostComposerFormProvider ref={ref}>
      <PostComposerSyncLastUsedProject />
      <PostComposerSyncDraftToLocalStorage />

      <Dialog.Root
        size={!isPostComposerExpanded ? '2xl' : '3xl'}
        fillHeight={isPostComposerExpanded}
        align='top'
        open={showComposerDialog}
        onOpenChange={handleOpenChange}
        visuallyHiddenTitle={VISUALLY_HIDDEN_TITLE}
        visuallyHiddenDescription={VISUALLY_HIDDEN_DESCRIPTION}
      >
        <PostComposerForm
          onSubmit={handleSubmit}
          onReportBug={handleReportBug}
          onDeleteDraft={handleDeleteDraftDialog}
        />
      </Dialog.Root>

      <DialogPrimitive.Root open={showComposerMole} onOpenChange={handleOpenChange} modal={false}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Title className='sr-only'>{VISUALLY_HIDDEN_TITLE}</DialogPrimitive.Title>
          <DialogPrimitive.Description className='sr-only'>{VISUALLY_HIDDEN_DESCRIPTION}</DialogPrimitive.Description>
          <DialogPrimitive.Content
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            className={cn(
              'fixed bottom-0 right-4',
              'focus:outline-none focus:ring-0',
              'bg-elevated dark:border-primary-opaque flex flex-col overflow-hidden rounded-t-xl border-b-0 border-l border-r border-t shadow-lg dark:border dark:border-b-0 dark:bg-gray-900 dark:shadow-[0px_2px_16px_rgba(0,0,0,1)]',
              {
                '3xl:w-[500px] 4xl:w-[520px] 3xl:h-[470px] 4xl:h-[490px] h-[450px] w-[460px] 2xl:w-[480px]':
                  isPostComposerExpanded,
                'min-h-12 w-[320px]': !isPostComposerExpanded
              }
            )}
          >
            {!isPostComposerExpanded ? (
              <div className='flex items-center px-3 pb-2.5 pl-4 pt-3'>
                <UIText weight='font-semibold'>New post</UIText>
                <PostComposerHeaderActions onDeleteDraft={handleDeleteDraftDialog} />
              </div>
            ) : (
              <PostComposerForm
                onSubmit={handleSubmit}
                onReportBug={handleReportBug}
                onDeleteDraft={handleDeleteDraftDialog}
              />
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <PostComposerDiscardDialog
        showDiscardDialog={showDiscardDialog}
        setShowDiscardDialog={setShowDiscardDialog}
        onDiscard={handleCloseDialog}
      />
      <PostComposerDeleteDraftPostDialog
        open={showDeleteDraftDialog}
        onOpenChange={setShowDeleteDraftDialog}
        onSuccess={handleCloseDialog}
      />
    </PostComposerFormProvider>
  )
}
