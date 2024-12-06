import * as SettingsSection from 'components/SettingsSection'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { OauthApplication } from '@campsite/types/generated'
import { TrashIcon, UIText } from '@campsite/ui'
import { ConfirmDialog } from '@campsite/ui/ConfirmDialog'

import { useScope } from '@/contexts/scope'
import { useDeleteOauthApplication } from '@/hooks/useDeleteOauthApplication'
import { apiErrorToast } from '@/utils/apiErrorToast'

export function DeleteIntegration({ oauthApplication }: { oauthApplication: OauthApplication }) {
  const { mutate, isPending } = useDeleteOauthApplication()
  const router = useRouter()
  const { scope } = useScope()

  const onConfirm = () => {
    mutate(oauthApplication.id, {
      onSuccess: () => {
        toast('Integration deleted')
        router.push(`/${scope}/settings/integrations/`)
      },
      onError: apiErrorToast
    })
  }

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Danger zone</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Separator />

      <div className='flex flex-col px-3 pb-3'>
        <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-700/10 dark:text-red-500'>
            <TrashIcon />
          </div>
          <div className='flex flex-1 flex-col'>
            <UIText weight='font-medium'>Delete integration</UIText>
            <UIText tertiary>There’s no going back. Deleting an integration is permanent.</UIText>
          </div>

          <ConfirmDialog.Root onConfirm={onConfirm} isLoading={isPending}>
            <ConfirmDialog.Trigger variant='destructive'>Delete integration</ConfirmDialog.Trigger>
            <ConfirmDialog.Dialog
              title='Delete integration'
              description='Are you sure you want to delete this integration?'
              confirmLabel='Delete'
            />
          </ConfirmDialog.Root>
        </div>
      </div>
    </SettingsSection.Section>
  )
}
