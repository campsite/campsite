import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { Button, FormError, MutationError, TextField } from '@campsite/ui'

import { AvatarUploader } from '@/components/AvatarUploader'
import { CoverPhotoPreview } from '@/components/CoverPhoto/Previewer'
import { CoverPhotoUploader } from '@/components/CoverPhoto/Uploader'
import * as SettingsSection from '@/components/SettingsSection'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useUpdateCurrentUser } from '@/hooks/useUpdateCurrentUser'
import { TransformedFile } from '@/utils/types'

export function ProfileDisplay() {
  const { data: currentUser } = useGetCurrentUser()
  const updateCurrentUser = useUpdateCurrentUser()
  const [displayName, setdisplayName] = useState(currentUser?.display_name)
  const [email, setEmail] = useState(currentUser?.email)
  const [profilePhoto, setProfilePhoto] = useState<TransformedFile | null>(null)
  const [coverPhoto, setCoverPhoto] = useState<TransformedFile | null>(null)
  const [profilePhotoError, setProfilePhotoError] = useState<Error | null>(null)
  const [coverPhotoError, setCoverPhotoError] = useState<Error | null>(null)
  const [coverPhotoSrc, setCoverPhotoSrc] = useState<string | null>(currentUser?.cover_photo_url ?? null)
  const previewableCoverPhoto = useMemo(
    () => (coverPhotoSrc ? coverPhotoSrc : coverPhoto ? window.URL.createObjectURL(coverPhoto.raw) : null),
    [coverPhoto, coverPhotoSrc]
  )

  const hasChanges =
    profilePhoto ||
    coverPhoto ||
    coverPhotoSrc !== currentUser?.cover_photo_url ||
    email !== currentUser?.email ||
    displayName !== currentUser?.display_name

  const onProfilePhotoUploadStart = useCallback((file: TransformedFile) => {
    setProfilePhoto(file)
    setProfilePhotoError(null)
  }, [])
  const onProfilePhotoUploadSuccess = useCallback((file: TransformedFile, key: string | null) => {
    setProfilePhoto({ ...file, key })
    setProfilePhotoError(null)
  }, [])
  const onProfilePhotoUploadError = useCallback((_file: TransformedFile, error: Error) => {
    setProfilePhotoError(error)
  }, [])

  const onCoverPhotoUploadStart = useCallback((file: TransformedFile) => {
    setCoverPhoto(file)
    setCoverPhotoError(null)
  }, [])
  const onCoverPhotoUploadSuccess = useCallback((file: TransformedFile, key: string | null) => {
    setCoverPhoto({ ...file, key })
    setCoverPhotoError(null)
  }, [])
  const onCoverPhotoUploadError = useCallback((_file: TransformedFile, error: Error) => {
    setCoverPhotoError(error)
  }, [])

  const disabledSubmit =
    !hasChanges ||
    updateCurrentUser.isPending ||
    !email ||
    !!profilePhotoError ||
    (profilePhoto ? !profilePhoto.key : false) ||
    !!coverPhotoError ||
    (coverPhoto ? !coverPhoto.key : false)

  function handleSubmit(event: any) {
    event.preventDefault()
    setProfilePhotoError(null)
    setCoverPhotoError(null)

    let input = {
      avatar_path: profilePhoto?.key,
      cover_photo_path: coverPhoto?.key ? coverPhoto.key : coverPhotoSrc ? coverPhotoSrc : null,
      name: displayName,
      username: currentUser?.username
    }

    // only pass the email if the user is not managed
    if (!currentUser?.managed) {
      input = Object.assign(input, { email })
    }

    updateCurrentUser.mutate(input, {
      onSuccess: async () => {
        if (email !== currentUser?.email) {
          toast(`Please verify your email — click the verification link sent to ${email}.`, {
            duration: Infinity,
            style: { background: '#3B82F6' }
          })
        }
      }
    })
  }

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Your profile</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>Customize how you appear to your teammates</SettingsSection.Description>

      <SettingsSection.Separator />

      <form className='flex flex-col' onSubmit={handleSubmit}>
        <div className='px-3 pb-3'>
          {previewableCoverPhoto && (
            <CoverPhotoPreview
              src={previewableCoverPhoto}
              onRemove={() => {
                setCoverPhoto(null)
                setCoverPhotoSrc(null)
              }}
            />
          )}

          {!coverPhoto && !coverPhotoSrc && (
            <CoverPhotoUploader
              onFileUploadError={onCoverPhotoUploadError}
              onFileUploadSuccess={onCoverPhotoUploadSuccess}
              resource='UserCoverPhoto'
              onFileUploadStart={onCoverPhotoUploadStart}
            />
          )}
        </div>

        <div className='flex flex-col items-start px-4 pb-6 pt-2 sm:flex-row sm:space-x-6 sm:pl-6'>
          <AvatarUploader
            onFileUploadError={onProfilePhotoUploadError}
            onFileUploadSuccess={onProfilePhotoUploadSuccess}
            src={currentUser?.avatar_url}
            resource='User'
            onFileUploadStart={onProfilePhotoUploadStart}
          />

          <div className='mt-5 flex w-full flex-col space-y-5 sm:mt-0'>
            <TextField
              type='text'
              id='name'
              name='name'
              label='Your name'
              value={displayName}
              placeholder='Your name'
              onChange={(value) => setdisplayName(value)}
              required
              maxLength={32}
              onCommandEnter={handleSubmit}
            />

            {!currentUser?.managed && (
              <TextField
                type='email'
                id='email'
                name='email'
                label='Email'
                value={email}
                placeholder='Your email'
                onChange={(value) => setEmail(value)}
                required
                onCommandEnter={handleSubmit}
              />
            )}

            {profilePhotoError && <FormError>{profilePhotoError.message}</FormError>}

            {coverPhotoError && <FormError>{coverPhotoError.message}</FormError>}

            {updateCurrentUser.isError && (
              <FormError>
                <MutationError mutation={updateCurrentUser} />
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
              loading={updateCurrentUser.isPending}
            >
              Save
            </Button>
          </div>
        </SettingsSection.Footer>
      </form>
    </SettingsSection.Section>
  )
}
