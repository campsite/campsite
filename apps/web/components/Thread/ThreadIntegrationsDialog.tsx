import { useEffect } from 'react'
import toast from 'react-hot-toast'

import { MessageThread, OauthApplication } from '@campsite/types'
import { Avatar } from '@campsite/ui/Avatar'
import { Button } from '@campsite/ui/Button'
import { Link } from '@campsite/ui/Link'
import { LazyLoadingSpinner } from '@campsite/ui/Spinner'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'

import { EmptyState } from '@/components/EmptyState'
import { useScope } from '@/contexts/scope'
import { useCreateThreadOauthApp } from '@/hooks/useCreateThreadOauthApp'
import { useDeleteThreadOauthApp } from '@/hooks/useDeleteThreadOauthApp'
import { useGetOauthApplications } from '@/hooks/useGetOauthApplications'
import { useGetThreadOauthApps } from '@/hooks/useGetThreadOauthApps'
import { useHash } from '@/hooks/useHash'

export function ThreadIntegrationsDialog({
  open,
  onOpenChange,
  thread
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  thread: MessageThread
}) {
  const { data: threadOauthApps, isLoading: isFetchingThreadOauthApps } = useGetThreadOauthApps({
    threadId: thread.id,
    enabled: open
  })
  const { data: orgOauthApps, isLoading: isFetchingOrgOauthApps } = useGetOauthApplications({
    enabled: open
  })
  const createOauthApp = useCreateThreadOauthApp({ threadId: thread.id })
  const removeOauthApp = useDeleteThreadOauthApp({ threadId: thread.id })
  const { scope } = useScope()
  const [hash, updateHash] = useHash()

  const isFetching = isFetchingThreadOauthApps || isFetchingOrgOauthApps
  const isSubmitting = createOauthApp.isPending || removeOauthApp.isPending

  useEffect(() => {
    if (!open && hash === '#manage-integrations') {
      onOpenChange(true)
      updateHash('')
    }
  }, [hash, onOpenChange, open, updateHash])

  function onAddOauthApp(oauthApp: OauthApplication) {
    createOauthApp.mutate(
      { oauth_application_id: oauthApp.id },
      {
        onSuccess: () => {
          toast(`Added ${oauthApp.name} to thread`)
        }
      }
    )
  }

  function onRemoveOauthApp(oauthApp: OauthApplication) {
    removeOauthApp.mutate(oauthApp.id, {
      onSuccess: () => {
        toast(`Removed ${oauthApp.name} from thread`)
      }
    })
  }

  const apps = orgOauthApps ?? []

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>
        <Dialog.Title>Integrations</Dialog.Title>
        <Dialog.Description>
          Create and manage integrations in your{' '}
          <Link href={`/${scope}/settings/integrations`} className='text-blue-500'>
            organization settings
          </Link>
          .
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Content>
        <div className='flex min-h-[100px] flex-col'>
          {isFetching ? (
            <LazyLoadingSpinner />
          ) : apps.length > 0 ? (
            <div className='flex-1 space-y-4 py-1'>
              {apps.map((oauthApp) => (
                <div className='flex items-center gap-3' key={oauthApp.id}>
                  <div className='flex flex-1 flex-row items-center gap-2.5'>
                    <Avatar src={oauthApp.avatar_url} alt={oauthApp.name} size='base' rounded='rounded-md' />
                    <UIText weight='font-medium' className='truncate'>
                      {oauthApp.name}
                    </UIText>
                  </div>

                  <div className='flex gap-1'>
                    {threadOauthApps?.find((app) => app.id === oauthApp.id) ? (
                      <Button variant='destructive' type='button' onClick={() => onRemoveOauthApp(oauthApp)}>
                        Remove from thread
                      </Button>
                    ) : (
                      <Button variant='base' type='button' onClick={() => onAddOauthApp(oauthApp)}>
                        Add to thread
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Your organization doesn't have any integrations." />
          )}
        </div>
      </Dialog.Content>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Done
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
