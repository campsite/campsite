import { useEffect, useState } from 'react'
import * as SettingsSection from 'components/SettingsSection'
import { useUpdateOrganization } from 'hooks/useUpdateOrganization'
import toast from 'react-hot-toast'

import { Button, InformationIcon, Link, Switch, TextField, UIText } from '@campsite/ui'

import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

export function VerifiedDomain() {
  const updateOrganization = useUpdateOrganization()
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data
  const { data: currentUser } = useGetCurrentUser()
  const viewerIsAdmin = useViewerIsAdmin()
  const [organizationEmailDomain, setOrganizationEmailDomain] = useState(currentOrganization?.email_domain || '')
  const [expanded, setExpanded] = useState(!!organizationEmailDomain)
  const [error, setError] = useState<string | null>(null)

  const changes = currentOrganization?.email_domain !== organizationEmailDomain
  const isEmpty = !currentOrganization?.email_domain && organizationEmailDomain.length === 0

  const disabledSubmit = !viewerIsAdmin || updateOrganization.isPending || !changes || isEmpty

  useEffect(() => {
    if (currentOrganization?.email_domain) {
      setOrganizationEmailDomain(currentOrganization.email_domain)
    }
  }, [currentOrganization])

  function handleChange(value: string) {
    setOrganizationEmailDomain(value)
    setError(null)
  }

  function handleSubmit(event: any) {
    event.preventDefault()
    setError(null)
    const email_domain = organizationEmailDomain || null

    updateOrganization.mutate(
      {
        email_domain
      },
      {
        onSuccess: async () => {
          toast(email_domain ? 'Verified domain updated' : 'Verified domain disabled')

          if (!email_domain) {
            setExpanded(false)
          }
        },
        onError: (error) => {
          setError(error.message)
        }
      }
    )
  }

  function disable() {
    setOrganizationEmailDomain('')
    setExpanded(false)

    updateOrganization.mutate(
      { email_domain: null },
      {
        onSuccess: async () => {
          toast('Verified domain disabled')
        },
        onError: (error) => {
          setError(error.message)
          setExpanded(true)
        }
      }
    )
  }

  const enabled = expanded || !!organizationEmailDomain

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Verified domain</SettingsSection.Title>
        <Switch
          checked={enabled}
          onChange={() => {
            if (currentOrganization?.email_domain) {
              disable()
            }

            setExpanded(!expanded)
          }}
          size='lg'
        />
      </SettingsSection.Header>

      <div className='h-1' />

      <SettingsSection.Description>
        When someone signs up for Campsite using an email that matches your verified domain, they will be automatically
        added to your organization as a member.
      </SettingsSection.Description>

      {!enabled && <div className='h-4' />}

      {enabled && (
        <>
          <SettingsSection.Separator />

          <form className='flex flex-col' onSubmit={handleSubmit}>
            <div className='max-w-lg px-3'>
              <TextField
                type='text'
                id='email_domain'
                name='email_domain'
                label='Email domain'
                labelHidden={true}
                value={organizationEmailDomain}
                placeholder={`e.g. ${currentUser?.email.split('@')[1]}`}
                disabled={!viewerIsAdmin}
                onChange={handleChange}
                inlineError={error}
                onCommandEnter={handleSubmit}
              />
            </div>

            {!currentOrganization?.email_domain && (
              <div className='flex max-w-lg items-start space-x-1 px-3 pt-3 text-blue-600'>
                <div className='flex-none'>
                  <InformationIcon />
                </div>
                <UIText tertiary selectable>
                  {`Verified domain must match your current email address domain (${
                    currentUser?.email.split('@')[1]
                  }) for
              security.`}{' '}
                  <Link
                    href='https://campsite.notion.site/Verified-Domain-95cdd30a9f934b81a916d82229b1de99'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-500 hover:underline'
                  >
                    Learn more
                  </Link>
                </UIText>
              </div>
            )}

            <div className='h-4' />

            <SettingsSection.Footer>
              <div className='w-full sm:w-auto'>
                <Button
                  fullWidth
                  type='submit'
                  variant='primary'
                  loading={updateOrganization.isPending}
                  disabled={disabledSubmit}
                >
                  Save
                </Button>
              </div>
            </SettingsSection.Footer>
          </form>
        </>
      )}
    </SettingsSection.Section>
  )
}
