import { useEffect, useState } from 'react'
import { AvatarUploader } from 'components/AvatarUploader'
import * as SettingsSection from 'components/SettingsSection'
import { useUpdateOrganization } from 'hooks/useUpdateOrganization'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { WEB_URL } from '@campsite/config'
import { Button, FormError, MutationError, TextField, UIText } from '@campsite/ui'

import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { TransformedFile } from '@/utils/types'

export function ProfileDisplay() {
  const router = useRouter()
  const { scope } = useScope()
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data
  const viewerIsAdmin = useViewerIsAdmin()
  const updateOrganization = useUpdateOrganization()
  const [organizationSlug, setOrganizationSlug] = useState(scope as string)
  const [organizationName, setOrganizationName] = useState(currentOrganization?.name)
  const [file, setFile] = useState<TransformedFile | null>(null)
  const [fileError, setFileError] = useState<Error | null>(null)
  const [isChangingSlug, setIsChangingSlug] = useState(false)

  const hasChanges = file || scope !== organizationSlug || organizationName !== currentOrganization?.name

  const disabledSubmit =
    !hasChanges ||
    updateOrganization.isPending ||
    !organizationSlug ||
    !viewerIsAdmin ||
    !!fileError ||
    (file ? !file.key : false)

  useEffect(() => {
    setOrganizationSlug(scope as string)
    setOrganizationName(currentOrganization?.name)
  }, [scope, currentOrganization])

  function handleSubmit(event: any) {
    event.preventDefault()
    setFileError(null)

    updateOrganization.mutate(
      {
        name: organizationName,
        slug: organizationSlug,
        avatar_path: file?.key
      },
      {
        onSuccess: async () => {
          if (scope !== organizationSlug) {
            await router.push(`/${organizationSlug}/settings`)
          }
          toast('Organization details updated')
        }
      }
    )
  }

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Organization profile</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>Customize how your organization appears to your team</SettingsSection.Description>

      <SettingsSection.Separator />

      <form className='flex flex-col' onSubmit={handleSubmit}>
        <div className='flex flex-col items-start px-4 pb-4 pt-2 sm:flex-row sm:space-x-6 sm:pl-6'>
          <AvatarUploader
            onFileUploadError={(_, error) => setFileError(error)}
            onFileUploadSuccess={(file, key) => {
              setFile({ ...file, key })
              setFileError(null)
            }}
            src={currentOrganization?.avatar_url}
            resource='Organization'
            onFileUploadStart={(file) => {
              setFile(file)
              setFileError(null)
            }}
          />

          <div className='flex w-full flex-col space-y-3 self-center'>
            <TextField
              type='text'
              id='name'
              name='name'
              label='Name'
              value={organizationName}
              placeholder='Name'
              onChange={(value) => setOrganizationName(value)}
              disabled={!viewerIsAdmin}
              required
              minLength={2}
              maxLength={32}
              onCommandEnter={handleSubmit}
            />

            {!isChangingSlug && (
              <span className='flex -translate-y-1 items-center gap-1.5'>
                <UIText size='text-sm' tertiary>
                  {WEB_URL.replace('https://', '') + '/' + scope}
                </UIText>
                <Button onClick={() => setIsChangingSlug(true)} size='sm' variant='plain'>
                  Edit
                </Button>
              </span>
            )}

            {isChangingSlug && (
              <>
                <TextField
                  type='text'
                  id='slug'
                  name='slug'
                  label='Slug'
                  helpText='Slugs can only contain lowercase alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.'
                  value={organizationSlug}
                  placeholder='Slug'
                  onChange={(value) => setOrganizationSlug(value)}
                  disabled={!viewerIsAdmin}
                  required
                  minLength={2}
                  maxLength={32}
                  autoFocus
                  prefix={WEB_URL.replace('https://', '') + '/'}
                  onCommandEnter={handleSubmit}
                />

                <UIText
                  size='text-xs'
                  className='text-balance rounded-md bg-orange-50 p-3 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                >
                  Changing your organization slug will update the URL to all content, including posts, calls, and docs.
                  Make sure to update any bookmarks or links after making this change.
                </UIText>
              </>
            )}

            {fileError && <FormError>{fileError?.message}</FormError>}

            {updateOrganization.isError && (
              <FormError>
                <MutationError mutation={updateOrganization} />
              </FormError>
            )}
          </div>
        </div>

        <SettingsSection.Footer>
          <div className='w-full sm:w-auto'>
            <Button
              type='submit'
              fullWidth
              variant='primary'
              disabled={disabledSubmit}
              loading={updateOrganization.isPending}
            >
              Save
            </Button>
          </div>
        </SettingsSection.Footer>
      </form>
    </SettingsSection.Section>
  )
}
