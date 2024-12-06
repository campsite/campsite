import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { OauthApplication, OrganizationsOrgSlugOauthApplicationsIdPutRequest } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { ConfirmDialog } from '@campsite/ui/ConfirmDialog'
import { TextField, TextFieldLabel } from '@campsite/ui/TextField'

import { CopySecretDialog } from '@/components/OrgSettings/OauthApplications/CopySecretDialog'
import * as SettingsSection from '@/components/SettingsSection'
import { useRenewOauthSecret } from '@/hooks/useRenewOauthSecret'
import { useUpdateOauthApplication } from '@/hooks/useUpdateOauthApplication'
import { apiErrorToast } from '@/utils/apiErrorToast'

type FormSchema = OrganizationsOrgSlugOauthApplicationsIdPutRequest

function useOauthSettingsForm(initialValues?: Pick<OauthApplication, 'redirect_uri'>) {
  return useForm<FormSchema>({
    defaultValues: {
      redirect_uri: initialValues?.redirect_uri ?? ''
    },
    resolver: zodResolver(
      z.object({
        redirect_uri: z
          .string()
          .optional()
          .refine((value) => !value || value === 'urn:ietf:wg:oauth:2.0:oob' || value?.startsWith('https://'), {
            message: 'Redirect URI must be an HTTPS URL'
          })
      })
    )
  })
}

function RegenerateSecretButton({ oauthApplication }: { oauthApplication: OauthApplication }) {
  const [copyOpen, setCopyOpen] = useState(false)
  const [secret, setSecret] = useState('')
  const { mutate: renewOauthSecret, isPending } = useRenewOauthSecret()

  const generateSecret = (onOpenChange?: (open: boolean) => void) => {
    onOpenChange?.(false)

    renewOauthSecret(
      { oauthApplicationId: oauthApplication.id },
      {
        onSuccess: (res) => {
          // should never happen
          if (!res.client_secret) {
            toast.error('Failed to generate secret')
            return
          }

          setSecret(res.client_secret)
          setCopyOpen(true)
          toast('Secret generated')
        },
        onError: apiErrorToast
      }
    )
  }

  return (
    <div>
      <CopySecretDialog open={copyOpen} onOpenChange={setCopyOpen} secret={secret} keyType='client_secret' />
      {oauthApplication.last_copied_secret_at ? (
        <ConfirmDialog.Root onConfirm={generateSecret} isLoading={isPending}>
          <ConfirmDialog.Trigger variant='base'>Re-generate secret</ConfirmDialog.Trigger>
          <ConfirmDialog.Dialog
            title='Re-generate secret'
            description='Are you sure you want to re-generate the secret? This will invalidate the current secret and force clients to re-authenticate.'
            confirmLabel='Re-generate'
          />
        </ConfirmDialog.Root>
      ) : (
        <Button onClick={() => generateSecret()} type='button' variant='base'>
          Generate secret
        </Button>
      )}
    </div>
  )
}

export function OauthSettings({ oauthApplication }: { oauthApplication: OauthApplication }) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, submitCount }
  } = useOauthSettingsForm(oauthApplication)
  const { mutate: updateOauthApplication, isPending: isUpdating } = useUpdateOauthApplication({
    id: oauthApplication?.id
  })

  const onSubmit = handleSubmit(async (data) => {
    updateOauthApplication(data, {
      onError: apiErrorToast,
      onSuccess: () => {
        toast('Integration updated')
      }
    })
  })

  const redirectUri = watch('redirect_uri')
  const showErrors = submitCount > 0

  return (
    <form onSubmit={onSubmit}>
      <SettingsSection.Section>
        <SettingsSection.Header>
          <SettingsSection.Title>OAuth settings</SettingsSection.Title>
        </SettingsSection.Header>
        <SettingsSection.Separator />
        <SettingsSection.Body className='space-y-4'>
          <TextField label='Client ID' name='uid' value={oauthApplication.client_id} clickToCopy />
          <div className='space-y-1'>
            <TextFieldLabel>Client secret</TextFieldLabel>
            <RegenerateSecretButton oauthApplication={oauthApplication} />
          </div>
          <TextField
            label='Redirect URI'
            name='redirect_uri'
            placeholder='https://example.com/oauth/callback'
            value={redirectUri}
            onChange={(value) => setValue('redirect_uri', value, { shouldValidate: true })}
            inlineError={showErrors && errors.redirect_uri ? errors.redirect_uri.message : undefined}
          />
        </SettingsSection.Body>
        <SettingsSection.Footer>
          <Button loading={isUpdating} disabled={isUpdating} type='submit' variant='primary'>
            Save
          </Button>
        </SettingsSection.Footer>
      </SettingsSection.Section>
    </form>
  )
}
