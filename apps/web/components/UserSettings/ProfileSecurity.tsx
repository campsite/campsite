import { useState } from 'react'
import * as SettingsSection from 'components/SettingsSection'
import { useGetCurrentUser } from 'hooks/useGetCurrentUser'
import { useUpdateCurrentUser } from 'hooks/useUpdateCurrentUser'
import toast from 'react-hot-toast'

import { Button, FormError, MutationError, TextField } from '@campsite/ui'

export function ProfileSecurity() {
  const { data: currentUser } = useGetCurrentUser()
  const updateCurrentUser = useUpdateCurrentUser()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  if (currentUser?.managed) {
    return null
  }

  function handleSubmit(event: any) {
    event.preventDefault()

    updateCurrentUser.mutate(
      {
        current_password: currentPassword,
        password: password,
        password_confirmation: passwordConfirmation
      },
      {
        onSuccess: async () => {
          toast('Password updated')
        }
      }
    )
  }

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Security</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>Update your password</SettingsSection.Description>

      <SettingsSection.Separator />

      <form className='flex flex-1 flex-col' onSubmit={handleSubmit}>
        <div className='flex flex-1 flex-col items-start px-3 sm:flex-row sm:space-x-6'>
          <div className='flex w-full max-w-lg flex-col space-y-5'>
            <TextField
              type='password'
              id='current-password'
              name='current-password'
              label='Current password'
              value={currentPassword}
              placeholder='Current password'
              onChange={(value) => setCurrentPassword(value)}
              required
            />

            <TextField
              type='password'
              id='password'
              name='password'
              label='New password'
              value={password}
              placeholder='New password'
              helpText='At least 10 characters'
              onChange={(value) => setPassword(value)}
              required
              minLength={10}
              maxLength={128}
            />

            <TextField
              type='password'
              id='password-confirmation'
              name='password-confirmation'
              label='Confirm new password'
              value={passwordConfirmation}
              placeholder='New password confirmation'
              onChange={(value) => setPasswordConfirmation(value)}
              required
              minLength={10}
            />

            <FormError>
              <MutationError mutation={updateCurrentUser} />
            </FormError>
          </div>
        </div>

        <SettingsSection.Footer>
          <div className='w-full sm:w-auto'>
            <Button
              type='submit'
              fullWidth
              variant='primary'
              disabled={
                updateCurrentUser.isPending ||
                !password ||
                !passwordConfirmation ||
                !currentPassword ||
                password !== passwordConfirmation
              }
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
