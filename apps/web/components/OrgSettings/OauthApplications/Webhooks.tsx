import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { OauthApplication, Webhook } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { Checkbox } from '@campsite/ui/Checkbox'
import * as Dialog from '@campsite/ui/Dialog'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { useCopyToClipboard } from '@campsite/ui/hooks'
import { CopyIcon, DotsHorizontal, GlobeIcon, PencilIcon, TrashIcon } from '@campsite/ui/Icons'
import { buildMenuItems } from '@campsite/ui/Menu'
import { UIText } from '@campsite/ui/Text'
import { TextField, TextFieldError, TextFieldLabel } from '@campsite/ui/TextField'

import * as SettingsSection from '@/components/SettingsSection'
import { useUpdateOauthApplication } from '@/hooks/useUpdateOauthApplication'
import { apiErrorToast } from '@/utils/apiErrorToast'

interface WebhookConfigDialogProps {
  oauthApplication: OauthApplication
  webhook?: Webhook
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormSchema {
  url: string
  eventTypes: string[]
}

// Sync this with SUPPORTED_EVENTS in the `Webhook` model file
const SUPPORTED_EVENTS = ['post.created', 'comment.created', 'app.mentioned', 'message.created', 'message.dm']

function WebhookConfigDialog({ open, onOpenChange, oauthApplication, webhook }: WebhookConfigDialogProps) {
  const { mutate: updateOauthApplication, isPending: isUpdating } = useUpdateOauthApplication({
    id: oauthApplication.id
  })

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormSchema>({
    defaultValues: {
      url: webhook?.url ?? '',
      eventTypes: webhook?.event_types ?? []
    },
    resolver: zodResolver(
      z.object({
        url: z
          .string()
          .url({ message: 'Invalid URL' })
          .refine((url) => url.startsWith('https://'), { message: 'Webhook URL must use HTTPS' }),
        eventTypes: z.array(z.string()).min(1, { message: 'Please select at least one event type' })
      })
    )
  })

  const onSubmit = handleSubmit(async (data) => {
    updateOauthApplication(
      {
        webhooks: [
          {
            id: webhook?.id,
            url: data.url,
            event_types: data.eventTypes
          }
        ]
      },
      {
        onError: apiErrorToast,
        onSuccess: () => {
          toast(webhook ? 'Webhook updated' : 'Webhook added')
          onOpenChange(false)
        }
      }
    )
  })

  const url = watch('url')
  const eventTypes = watch('eventTypes') ?? []

  return (
    <Dialog.Root size='base' align='center' open={open} onOpenChange={onOpenChange} disableDescribedBy>
      <Dialog.Header className='border-b'>
        <Dialog.Title className='flex items-center justify-start gap-2'>
          {webhook ? 'Edit' : 'Add'} webhook
        </Dialog.Title>
      </Dialog.Header>
      <form onSubmit={onSubmit}>
        <Dialog.Content className='space-y-3 pt-3'>
          <TextField
            label='Webhook URL'
            value={url}
            onChange={(value) => setValue('url', value)}
            inlineError={errors.url?.message}
          />
          <div>
            <TextFieldLabel>Events</TextFieldLabel>
            <div className='mt-1 space-y-1.5'>
              {SUPPORTED_EVENTS.map((eventType) => (
                <label htmlFor={eventType} className='flex cursor-pointer items-center gap-2' key={eventType}>
                  <Checkbox
                    id={eventType}
                    checked={eventTypes.includes(eventType)}
                    onChange={(checked) =>
                      setValue(
                        'eventTypes',
                        checked ? [...eventTypes, eventType] : eventTypes.filter((s) => s !== eventType)
                      )
                    }
                  />
                  <div className='flex-1 font-mono'>
                    <UIText size='text-sm'>{eventType}</UIText>
                  </div>
                </label>
              ))}
            </div>
            {errors.eventTypes?.message && <TextFieldError>{errors.eventTypes.message}</TextFieldError>}
          </div>
        </Dialog.Content>
        <Dialog.Footer>
          <Dialog.LeadingActions>
            <Button type='button' variant='base' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </Dialog.LeadingActions>
          <Dialog.TrailingActions>
            <Button type='submit' variant='primary' loading={isUpdating}>
              {webhook ? 'Save changes' : 'Add webhook'}
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </form>
    </Dialog.Root>
  )
}

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  oauthApplication
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  oauthApplication: OauthApplication
}) {
  const { mutate: updateOauthApplication, isPending: isUpdating } = useUpdateOauthApplication({
    id: oauthApplication.id
  })

  const deleteWebhook = () => {
    if (isUpdating) return

    updateOauthApplication(
      { webhooks: [] },
      {
        onError: apiErrorToast,
        onSuccess: () => {
          toast('Webhook deleted')
          onOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>
        <Dialog.Title>Delete webhook</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content>
        <Dialog.Description className='text-sm'>Are you sure you want to delete this webhook?</Dialog.Description>
      </Dialog.Content>
      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={deleteWebhook} autoFocus disabled={isUpdating} loading={isUpdating}>
            Delete webhook
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}

function WebhookOverflowMenu({ oauthApplication, webhook }: { oauthApplication: OauthApplication; webhook: Webhook }) {
  const [editDialogIsOpen, setEditDialogIsOpen] = useState(false)
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)
  const [copy] = useCopyToClipboard()

  function copySecret(secret: string) {
    copy(secret)
    toast('Copied webhook secret to clipboard')
  }

  const items = buildMenuItems([
    {
      type: 'item',
      leftSlot: <PencilIcon />,
      label: 'Edit',
      onSelect: () => setEditDialogIsOpen(true)
    },
    {
      type: 'item',
      leftSlot: <CopyIcon />,
      label: 'Copy secret',
      onSelect: () => copySecret(webhook.secret)
    },
    {
      type: 'item',
      leftSlot: <TrashIcon />,
      label: 'Delete',
      destructive: true,
      onSelect: () => setDeleteDialogIsOpen(true)
    }
  ])

  return (
    <>
      <DropdownMenu
        items={items}
        align='end'
        trigger={<Button variant='plain' iconOnly={<DotsHorizontal />} accessibilityLabel='Webhook options' />}
      />
      <WebhookConfigDialog
        open={editDialogIsOpen}
        onOpenChange={setEditDialogIsOpen}
        oauthApplication={oauthApplication}
        webhook={webhook}
        key={editDialogIsOpen ? 'open' : 'closed'}
      />
      <ConfirmDeleteDialog
        open={deleteDialogIsOpen}
        onOpenChange={setDeleteDialogIsOpen}
        oauthApplication={oauthApplication}
      />
    </>
  )
}

export function Webhooks({ oauthApplication }: { oauthApplication: OauthApplication }) {
  const [open, setOpen] = useState(false)

  return (
    <SettingsSection.Section>
      <SettingsSection.Header className='p-3'>
        <div>
          <SettingsSection.Title>
            Webhooks
            <UIText tertiary>
              Send an HTTP POST request after certain events.{` `}
              <a href='https://developers.campsite.com/api-reference/guides/webhooks' className='text-blue-500'>
                Docs &rsaquo;
              </a>
            </UIText>
          </SettingsSection.Title>
        </div>
        {oauthApplication.webhooks.length === 0 && (
          <>
            <Button type='button' variant='base' onClick={() => setOpen(true)}>
              Add webhook
            </Button>
            <WebhookConfigDialog
              open={open}
              onOpenChange={setOpen}
              oauthApplication={oauthApplication}
              key={open ? 'open' : 'closed'}
            />
          </>
        )}
      </SettingsSection.Header>
      {oauthApplication.webhooks.length > 0 && (
        <>
          <SettingsSection.Separator className='mt-0' />
          <SettingsSection.Body className='min-h-[42px] space-y-4'>
            <div>
              {oauthApplication.webhooks.map((webhook) => (
                <div key={webhook.id} className='flex items-center justify-between gap-2'>
                  <div className='flex min-w-0 items-center gap-1 text-sm'>
                    <GlobeIcon />
                    <div className='flex-1 truncate'>{webhook.url}</div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <WebhookOverflowMenu oauthApplication={oauthApplication} webhook={webhook} />
                  </div>
                </div>
              ))}
            </div>
          </SettingsSection.Body>
        </>
      )}
    </SettingsSection.Section>
  )
}
