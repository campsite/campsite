import toast from 'react-hot-toast'

import { OauthApplication, Project } from '@campsite/types'
import { Avatar } from '@campsite/ui/Avatar'
import { Button } from '@campsite/ui/Button'
import { Link } from '@campsite/ui/Link'
import { LazyLoadingSpinner } from '@campsite/ui/Spinner'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'

import { EmptyState } from '@/components/EmptyState'
import { useScope } from '@/contexts/scope'
import { useCreateProjectOauthApp } from '@/hooks/useCreateProjectOauthApp'
import { useDeleteProjectOauthApp } from '@/hooks/useDeleteProjectOauthApp'
import { useGetOauthApplications } from '@/hooks/useGetOauthApplications'
import { useGetProjectOauthApps } from '@/hooks/useGetProjectOauthApps'

interface ProjectIntegrationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
}

export function ProjectIntegrationsDialog({ open, onOpenChange, project }: ProjectIntegrationsDialogProps) {
  const { data: projectOauthApps, isLoading: isFetchingProjectOauthApps } = useGetProjectOauthApps({
    projectId: project.id,
    enabled: open
  })
  const { data: orgOauthApps, isLoading: isFetchingOrgOauthApps } = useGetOauthApplications({
    enabled: open
  })
  const createOauthApp = useCreateProjectOauthApp({ projectId: project.id })
  const removeOauthApp = useDeleteProjectOauthApp({ projectId: project.id })
  const { scope } = useScope()

  const isFetching = isFetchingProjectOauthApps || isFetchingOrgOauthApps
  const isSubmitting = createOauthApp.isPending || removeOauthApp.isPending

  function onAddOauthApp(oauthApp: OauthApplication) {
    createOauthApp.mutate(
      { oauth_application_id: oauthApp.id },
      {
        onSuccess: () => {
          toast(`Added ${oauthApp.name} to ${project.name}`)
        }
      }
    )
  }

  function onRemoveOauthApp(oauthApp: OauthApplication) {
    removeOauthApp.mutate(oauthApp.id, {
      onSuccess: () => {
        toast(`Removed ${oauthApp.name} from ${project.name}`)
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
                    {projectOauthApps?.find((app) => app.id === oauthApp.id) ? (
                      <Button variant='destructive' type='button' onClick={() => onRemoveOauthApp(oauthApp)}>
                        Remove from channel
                      </Button>
                    ) : (
                      <Button variant='base' type='button' onClick={() => onAddOauthApp(oauthApp)}>
                        Add to channel
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
