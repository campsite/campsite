import { ClipboardEvent, KeyboardEvent, useCallback, useRef, useState } from 'react'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'

import { AttachIcon, Button, CloseIcon, Link, PlanetIcon, TextField, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'
import { isMetaEnter } from '@campsite/ui/src/utils'

import { useScope } from '@/contexts/scope'
import { useCreateFeedback } from '@/hooks/useCreateFeedback'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useIsCampsiteScope } from '@/hooks/useIsCampsiteScope'
import { useStoredState } from '@/hooks/useStoredState'
import { useFileUploadMutation } from '@/hooks/useUploadFile'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { filesFromClipboardData } from '@/utils/filesFromClipboardData'
import { transformFile } from '@/utils/transformFile'
import { TransformedFile } from '@/utils/types'

import { FeedbackFilePreview } from './FeedbackFilePreview'

interface FeedbackType {
  open: boolean
  value: string
}

const feedbackDialogOpenAtom = atom<boolean>(false)
const feedbackDialogValueAtom = atomWithStorage<string>('feedback', '')

const feedbackAtom = atom<FeedbackType>((get) => ({
  open: get(feedbackDialogOpenAtom),
  value: get(feedbackDialogValueAtom)
}))

export const setFeedbackDialogOpenAtom = atom(null, (_, set, value: boolean) => {
  set(feedbackDialogOpenAtom, value)
})

export const setFeedbackDialogValueAtom = atom(null, (_, set, value: string) => {
  set(feedbackDialogValueAtom, value)
})

export function FeedbackDialog() {
  const { isCampsiteScope } = useIsCampsiteScope()
  const { data: organization } = useGetCurrentOrganization()
  const insiderUpsellEligible = organization?.paid
  const [upsellDismissed, setUpsellDismissed] = useStoredState('insiders-upsell-dismissed', false)
  const showInsidersUpsell = insiderUpsellEligible && !upsellDismissed && !isCampsiteScope
  const createFeedback = useCreateFeedback()
  const { scope } = useScope()
  const { asPath } = useRouter()
  const feedbackState = useAtomValue(feedbackAtom)
  const setFeedbackDialogOpen = useSetAtom(setFeedbackDialogOpenAtom)
  const setFeedbackValue = useSetAtom(setFeedbackDialogValueAtom)
  const [screenshot, setScreenshot] = useState<TransformedFile | null>(null)

  function onFileUploadComplete(
    file: TransformedFile,
    file_path: string | null,
    property: 'key' | 'preview_file_path'
  ) {
    setScreenshot({
      ...file,
      [property]: file_path
    })
  }

  function onFileUploadError(file: TransformedFile, error: Error) {
    setScreenshot({
      ...file,
      error: error ?? file.error
    })
  }

  const { mutate: fileUploadMutation, isPending } = useFileUploadMutation(
    onFileUploadComplete,
    onFileUploadError,
    'key'
  )

  const formRef = useRef<HTMLFormElement>(null)

  const onPaste = useCallback(
    async (event: ClipboardEvent<HTMLFormElement>) => {
      const files = filesFromClipboardData(event)

      if (files.length) {
        event.stopPropagation()

        const file = files[0]

        const transformedFile = await transformFile(file)

        setScreenshot(transformedFile)

        fileUploadMutation({
          file: transformedFile,
          orgSlug: scope as string,
          resource: 'FeedbackLogs'
        })
      }
    },
    [fileUploadMutation, scope]
  )

  async function handleSubmit(e: any) {
    e.preventDefault()

    createFeedback.mutate(
      {
        description: feedbackState.value,
        feedback_type: 'bug',
        screenshot_path: screenshot?.key ?? undefined,
        current_url: asPath
      },
      {
        onSuccess: () => {
          toast('Feedback shared. Thank you!')
          setFeedbackDialogOpen(false)
          setFeedbackValue('')
          setScreenshot(null)
        },
        onError: apiErrorToast
      }
    )
  }

  function handleCommandEnter(event: KeyboardEvent<HTMLFormElement>) {
    if (isMetaEnter(event)) {
      handleSubmit(event)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const acceptedFile = acceptedFiles[0]

      if (!acceptedFile) {
        return toast.error(
          'Attachments must be an image (.jpg, .jpeg, .png) or video (.webm, .mp4, .mov) and be less than 100mb'
        )
      }

      const transformedFile = await transformFile(acceptedFile)

      setScreenshot(transformedFile)

      fileUploadMutation({
        file: transformedFile,
        orgSlug: scope as string,
        resource: 'FeedbackLogs'
      })
    },
    [scope, fileUploadMutation]
  )

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100mb,
    useFsAccessApi: false,
    multiple: false,
    noClick: true,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'video/webm': ['.webm'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov']
    }
  })

  return (
    <div {...getRootProps()}>
      <Dialog.Root
        open={feedbackState.open}
        onOpenChange={setFeedbackDialogOpen}
        size='2xl'
        align={isMobile ? 'top' : 'center'}
        visuallyHiddenDescription='Share feedback, feature requests, or report a bug'
      >
        <Dialog.Header>
          <Dialog.Title>Share feedback</Dialog.Title>
        </Dialog.Header>

        <Dialog.Content>
          <form onPasteCapture={onPaste} ref={formRef} onSubmit={handleSubmit} className='flex flex-col gap-3 pt-0.5'>
            <TextField
              placeholder='Share feedback, feature requests, or report a bug...'
              multiline
              minRows={isMobile ? 5 : 6}
              maxRows={isMobile ? 5 : 12}
              autoFocus
              name='feedback'
              onKeyDownCapture={handleCommandEnter}
              value={feedbackState.value}
              onChange={setFeedbackValue}
            />

            {screenshot && (
              <div className='flex flex-row items-center space-x-3'>
                <FeedbackFilePreview file={screenshot} reorderable={false} onRemove={() => setScreenshot(null)} />
              </div>
            )}

            {!screenshot && (
              <div className='justify-self-start'>
                <input name='files rounded-full' {...getInputProps()} />
                <Button leftSlot={<AttachIcon />} onClick={open}>
                  Attach screenshot
                </Button>
              </div>
            )}
          </form>
        </Dialog.Content>

        {showInsidersUpsell && (
          <div className='bg-secondary pb-4.5 hidden items-start gap-3 border-t p-3 lg:flex'>
            <PlanetIcon size={40} className='-translate-y-0.5' />
            <div className='flex flex-col gap-3 pt-1'>
              <UIText className='text-balance' secondary>
                Join the <span className='text-primary font-medium'>Campsite Insiders</span> channel to share feedback
                directly with the Campsite team and get early access to new features.
              </UIText>

              <Button
                className='self-start'
                externalLink
                href='https://app.campsite.com/guest/5r72qd3xuW1x4EHwHpw4'
                variant='primary'
                onClick={() => setUpsellDismissed(true)}
              >
                Join insiders
              </Button>
            </div>
            <div className='ml-auto'>
              <Button
                variant='plain'
                size='sm'
                onClick={() => setUpsellDismissed(true)}
                iconOnly={<CloseIcon />}
                accessibilityLabel='Dismiss'
              />
            </div>
          </div>
        )}

        <Dialog.Footer>
          <Dialog.LeadingActions>
            <Link
              target='_blank'
              rel='noopener noreferrer'
              href='https://twitter.com/trycampsite'
              className='text-tertiary hover:text-secondary group hidden items-center justify-center gap-2 px-2 hover:text-opacity-100 sm:flex'
            >
              <Image
                src='/img/services/twitter.png'
                width={16}
                height={16}
                className='rounded-md grayscale group-hover:grayscale-0'
                alt='Twitter logo'
              />
              <UIText inherit>@trycampsite</UIText>
            </Link>
          </Dialog.LeadingActions>
          <Dialog.TrailingActions>
            <Button variant='flat' onClick={() => setFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={createFeedback.isPending || feedbackState.value == null || feedbackState.value.length === 0}
              loading={createFeedback.isPending || isPending}
              type='submit'
              variant='primary'
              onClick={handleSubmit}
            >
              Send feedback
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </Dialog.Root>
    </div>
  )
}
