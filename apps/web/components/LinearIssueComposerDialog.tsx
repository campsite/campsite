import { KeyboardEvent, useCallback, useState } from 'react'
import { UseMutationResult } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'react-hot-toast'

import {
  CreateLinearIssue,
  OrganizationPostLinearIssuesPostRequest,
  PostCommentsLinearIssuesData,
  PostPostsLinearIssuesData
} from '@campsite/types/generated'
import { Button, FormError, TextField, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'
import { isMetaEnter } from '@campsite/ui/src/utils'
import { ToastWithLink } from '@campsite/ui/Toast'

import { lastUsedLinearTeamAtom, LinearTeamPicker } from '@/components/LinearTeamPicker'
import { useFormSetValue } from '@/components/PostComposer/hooks/useFormSetValue'
import { useCreateCommentLinearIssue } from '@/hooks/useCreateCommentLinearIssue'
import { useCreatePostLinearIssue } from '@/hooks/useCreatePostLinearIssue'
import { useGetLinearTeams } from '@/hooks/useGetLinearTeams'
import { apiErrorToast } from '@/utils/apiErrorToast'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<Pick<FormSchema, 'title' | 'description'>>
}

type FormSchema = OrganizationPostLinearIssuesPostRequest

function useIssueForm({ defaultValues }: Pick<DialogProps, 'defaultValues'>) {
  const getTeams = useGetLinearTeams()
  const firstAndOnlyTeamId = getTeams.data?.length === 1 ? getTeams.data?.[0]?.provider_team_id : undefined
  const lastUsedTeamId = useAtomValue(lastUsedLinearTeamAtom)

  return useForm<FormSchema>({
    defaultValues: {
      team_id: firstAndOnlyTeamId ?? lastUsedTeamId ?? undefined,
      title: '',
      description: '',
      ...defaultValues
    }
  })
}

function useIssueStatusChange({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const onStatusChange = useCallback(
    (data: PostPostsLinearIssuesData | PostCommentsLinearIssuesData) => {
      // Multiple dialogs of the same kind can be mounted at once (i.e. overflow menu and sidebar).
      // To avoid duplicates toasts, we need to make sure we only trigger actions if the given the dialog is open.
      if (open && data.status === 'success') {
        if (data.external_record) {
          toast(
            <ToastWithLink url={data.external_record?.remote_record_url} externalLink>
              Linear issue created
            </ToastWithLink>,
            {
              duration: 5000
            }
          )
        } else {
          toast('Linear issue created')
        }
        onOpenChange(false)
      }
    },
    [onOpenChange, open]
  )

  return { onStatusChange }
}

export function LinearPostIssueComposerDialog({
  open,
  onOpenChange,
  defaultValues,
  postId
}: DialogProps & { postId: string }) {
  const { onStatusChange } = useIssueStatusChange({ open, onOpenChange })
  const { createIssue, status } = useCreatePostLinearIssue({ postId, onStatusChange })
  const form = useIssueForm({ defaultValues })

  return (
    <FormProvider {...form}>
      <IssueComposer open={open} onOpenChange={onOpenChange} createIssue={createIssue} status={status} />
    </FormProvider>
  )
}

export function LinearCommentIssueComposerDialog({
  open,
  onOpenChange,
  defaultValues,
  commentId
}: DialogProps & { commentId: string }) {
  const { onStatusChange } = useIssueStatusChange({ open, onOpenChange })
  const { createIssue, status } = useCreateCommentLinearIssue({ commentId, onStatusChange })
  const form = useIssueForm({ defaultValues })

  return (
    <FormProvider {...form}>
      <IssueComposer open={open} onOpenChange={onOpenChange} createIssue={createIssue} status={status} />
    </FormProvider>
  )
}

function IssueComposer({
  open,
  onOpenChange,
  status,
  createIssue
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  createIssue: UseMutationResult<CreateLinearIssue, Error, OrganizationPostLinearIssuesPostRequest, unknown>
  status: PostPostsLinearIssuesData['status'] | null
}) {
  const { handleSubmit, watch, formState } = useFormContext<FormSchema>()
  const { dirtyFields } = formState
  const setValue = useFormSetValue()
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  const onSubmit = handleSubmit(async (data) => {
    createIssue.mutate(
      {
        title: data.title,
        description: data.description,
        team_id: data.team_id
      },
      {
        onError: apiErrorToast
      }
    )
  })

  function handleCommandEnter(event: KeyboardEvent) {
    if (isMetaEnter(event)) {
      onSubmit(event)
    }
  }

  const title = watch('title')
  const description = watch('description')
  const teamId = watch('team_id')
  const isDirty = dirtyFields.title || dirtyFields.description
  const isSubmitting = createIssue.isPending || status === 'pending'
  const canSubmit = !!title && !!teamId && !isSubmitting

  function checkDirtyStateAndClose(open: boolean) {
    if (isDirty) {
      setShowDiscardDialog(true)
    } else {
      onOpenChange(open)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={checkDirtyStateAndClose} size='2xl' align={isMobile ? 'top' : 'center'}>
      <form onSubmit={onSubmit} className='flex flex-col gap-3 overflow-y-auto'>
        <Dialog.Header className='flex items-center gap-2'>
          <Image src='/img/services/linear-app-icon.png' width='24' height='24' alt='Linear' />
          <Dialog.Title>Create Linear issue</Dialog.Title>
        </Dialog.Header>

        <Dialog.Content>
          <div className='space-y-3'>
            <TextField
              label='Title'
              name='title'
              value={title}
              onChange={(value) => setValue('title', value)}
              autoFocus
              placeholder='Issue title'
              onKeyDownCapture={handleCommandEnter}
            />
            <TextField
              label='Description'
              name='description'
              value={description}
              onChange={(value) => setValue('description', value)}
              placeholder='Issue description'
              multiline
              minRows={isMobile ? 3 : 6}
              onKeyDownCapture={handleCommandEnter}
            />
            <div>
              <UIText element='label' secondary weight='font-medium' className='mb-1.5 block' size='text-xs'>
                Team
              </UIText>
              <LinearTeamPicker
                activeId={teamId}
                onChange={(team) => setValue('team_id', team.provider_team_id)}
                onKeyDownCapture={handleCommandEnter}
              />
            </div>

            {status === 'failed' && <FormError>Failed to create Linear issue</FormError>}
          </div>
        </Dialog.Content>

        <Dialog.Footer>
          <Dialog.LeadingActions>
            <Button variant='flat' onClick={() => checkDirtyStateAndClose(false)}>
              Cancel
            </Button>
          </Dialog.LeadingActions>
          <Dialog.TrailingActions>
            <Button disabled={!canSubmit} loading={isSubmitting} type='submit' variant='primary'>
              Create issue
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </form>

      {showDiscardDialog && (
        <Dialog.Root open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <Dialog.Header>
            <Dialog.Title>You have unsaved changes</Dialog.Title>
            <Dialog.Description>Are you sure you want to discard your draft?</Dialog.Description>
          </Dialog.Header>

          <Dialog.Footer>
            <Dialog.TrailingActions>
              <Button variant='flat' onClick={() => setShowDiscardDialog(false)}>
                Cancel
              </Button>

              <Button
                variant='destructive'
                onClick={() => {
                  setShowDiscardDialog(false)
                  onOpenChange(false)
                }}
                autoFocus
              >
                Discard
              </Button>
            </Dialog.TrailingActions>
          </Dialog.Footer>
        </Dialog.Root>
      )}
    </Dialog.Root>
  )
}
