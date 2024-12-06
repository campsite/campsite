import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { OauthApplication, OrganizationsOrgSlugOauthApplicationsPostRequest } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { FormError } from '@campsite/ui/FormError'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'
import { TextField } from '@campsite/ui/TextField'

import { AvatarUploader } from '@/components/AvatarUploader'
import { useScope } from '@/contexts/scope'
import { useCreateOauthApplication } from '@/hooks/useCreateOauthApplication'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { TransformedFile } from '@/utils/types'

interface OauthApplicationFormDialogProps {
  open: boolean
  oauthApplication?: OauthApplication
  onOpenChange: (open: boolean) => void
}

type FormSchema = OrganizationsOrgSlugOauthApplicationsPostRequest

function useCreateAppForm() {
  return useForm<FormSchema>({
    defaultValues: {
      name: '',
      avatar_path: ''
    },
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, 'Name is required'),
        avatar_path: z.string().optional()
      })
    )
  })
}

export function CreateOauthApplicationDialog({
  open,
  onOpenChange
}: Omit<OauthApplicationFormDialogProps, 'oauthApplication'>) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, submitCount }
  } = useCreateAppForm()
  const router = useRouter()
  const { scope } = useScope()
  const { mutate, isPending } = useCreateOauthApplication()

  const [avatar, setAvatar] = useState<TransformedFile | null>(null)
  const [avatarError, setAvatarError] = useState<Error | null>(null)
  const isUploadingAvatar = !!avatar && !avatar?.key

  const onSubmit = handleSubmit(async (data) => {
    mutate(data, {
      onError: apiErrorToast,
      onSuccess: (res) => {
        router.push(`/${scope}/settings/integrations/${res.id}`)
        onOpenChange(false)
        toast('Integration created')
      }
    })
  })

  const name = watch('name')
  const showErrors = submitCount > 0

  return (
    <Dialog.Root size='lg' align='center' open={open} onOpenChange={onOpenChange} disableDescribedBy>
      <form onSubmit={onSubmit} className='space-y-3'>
        <Dialog.Header>
          <Dialog.Title className='flex items-center justify-start gap-2'>Create integration</Dialog.Title>
        </Dialog.Header>
        <Dialog.Content className='space-y-3'>
          <div className='space-y-4'>
            <TextField
              label='Name'
              name='name'
              autoFocus
              placeholder='Integration name'
              value={name}
              onChange={(value) => setValue('name', value, { shouldValidate: true })}
              inlineError={showErrors && errors.name ? errors.name.message : undefined}
            />
            <div>
              <UIText element='label' secondary weight='font-medium' className='mb-1.5 block' size='text-xs'>
                Avatar
              </UIText>
              <div className='flex'>
                <AvatarUploader
                  size='sm'
                  onFileUploadError={(_, error) => setAvatarError(error)}
                  onFileUploadSuccess={(file, key) => {
                    if (key) {
                      setAvatar({ ...file, key })
                      setValue('avatar_path', key)
                      setAvatarError(null)
                    }
                  }}
                  resource='OauthApplication'
                  onFileUploadStart={(file) => {
                    setAvatar(file)
                    setAvatarError(null)
                  }}
                />
              </div>
            </div>
          </div>
          {avatarError && <FormError>{avatarError.message}</FormError>}
        </Dialog.Content>
        <Dialog.Footer>
          <Dialog.LeadingActions>
            <Button variant='flat' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </Dialog.LeadingActions>
          <Dialog.TrailingActions>
            <Button loading={isPending} disabled={isUploadingAvatar} type='submit' variant='primary'>
              Create integration
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </form>
    </Dialog.Root>
  )
}
