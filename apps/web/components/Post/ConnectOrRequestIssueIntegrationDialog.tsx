import { useSetAtom } from 'jotai'
import Image from 'next/image'

import { Button } from '@campsite/ui/Button'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'

import { setFeedbackDialogOpenAtom, setFeedbackDialogValueAtom } from '@/components/Feedback/FeedbackDialog'
import { useLinearAuthorizationUrl } from '@/hooks/useLinearAuthorizationUrl'

export function ConnectOrRequestIssueIntegrationDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const callbackUrl = useLinearAuthorizationUrl()
  const setFeedbackDialogOpen = useSetAtom(setFeedbackDialogOpenAtom)
  const setFeedbackValue = useSetAtom(setFeedbackDialogValueAtom)

  const apps = [
    {
      name: 'GitHub',
      icon: '/img/services/github-app-icon.png'
    },
    {
      name: 'Asana',
      icon: '/img/services/asana-app-icon.png'
    },
    {
      name: 'Jira',
      icon: '/img/services/jira-app-icon.png'
    },
    {
      name: 'Other',
      icon: '/img/services/other-app-icon.png'
    }
  ]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg' align='top'>
      <Dialog.Header>
        <Dialog.Title>Integrations</Dialog.Title>
        <Dialog.Description className='space-y-2'>Create and connect your issues</Dialog.Description>
      </Dialog.Header>

      <Dialog.Content className='flex flex-col p-0'>
        <div className='border-b p-3 pt-0'>
          <div className='flex w-full items-center gap-2'>
            <Image src='/img/services/linear-app-icon.png' width='36' height='36' alt='Linear app icon' />
            <UIText weight='font-medium'>Linear</UIText>
            <Button
              className='ml-auto'
              variant='primary'
              href={callbackUrl}
              externalLink
              allowOpener
              onClick={(e) => {
                if (callbackUrl.includes(':3001')) {
                  e.preventDefault()
                  e.stopPropagation()
                  alert('Localhost detected; this button will not work. Please connect using the ngrok app.')
                }
              }}
            >
              Connect
            </Button>
          </div>
        </div>

        <div className='bg-secondary flex flex-col gap-2 p-3'>
          <UIText tertiary weight='font-medium' className='my-2 pl-0.5'>
            Request an integration
          </UIText>

          {apps.map((app) => (
            <div key={app.name} className='flex w-full items-center gap-2'>
              <Image
                src={app.icon}
                width='36'
                height='36'
                alt={`${app.name} app icon`}
                role='presentation'
                aria-hidden
              />
              <UIText weight='font-medium'>{app.name}</UIText>
              <Button
                className='ml-auto'
                variant='flat'
                onClick={() => {
                  setFeedbackValue(
                    `Integration request: ${app.name}\n\nShare more details about your toolkit and workflow...`
                  )
                  setFeedbackDialogOpen(true)
                  onOpenChange(false)
                }}
              >
                Request
              </Button>
            </div>
          ))}
        </div>
      </Dialog.Content>

      <Dialog.Footer>
        <Dialog.LeadingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </Dialog.LeadingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
