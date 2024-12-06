import { useMemo, useState } from 'react'
import { addHours } from 'date-fns'
import { isMobile } from 'react-device-detect'
import { uniqBy } from 'remeda'

import { OrganizationsOrgSlugMembersMeStatusesPostRequest } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { Checkbox } from '@campsite/ui/Checkbox'
import { ChevronDownIcon, InformationIcon } from '@campsite/ui/Icons'
import { Link } from '@campsite/ui/Link'
import { Select } from '@campsite/ui/Select'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'
import { TextField } from '@campsite/ui/TextField'
import { Tooltip } from '@campsite/ui/Tooltip'

import { DateAndTimePicker } from '@/components/DateAndTimePicker'
import { FullPageLoading } from '@/components/FullPageLoading'
import { getTimeRemaining } from '@/components/MemberStatus'
import { ReactionPicker } from '@/components/Reactions/ReactionPicker'
import { useScope } from '@/contexts/scope'
import { useCreateStatus } from '@/hooks/useCreateStatus'
import { useDeleteStatus } from '@/hooks/useDeleteStatus'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetNotificationSchedule } from '@/hooks/useGetNotificationSchedule'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'
import { useRecentStatuses } from '@/hooks/useRecentStatuses'
import { useStatusIsExpired } from '@/hooks/useStatusIsExpired'
import { useUpdateStatus } from '@/hooks/useUpdateStatus'
import { isStandardReaction } from '@/utils/reactions'

const DEFAULT_STATUSES: OrganizationsOrgSlugMembersMeStatusesPostRequest[] = [
  {
    emoji: '🥪',
    message: 'Lunch',
    expiration_setting: '30m'
  },
  {
    emoji: '🗓️',
    message: 'In a meeting',
    expiration_setting: '1h'
  },
  {
    emoji: '🧠',
    message: 'Deep work',
    expiration_setting: '4h'
  },
  {
    emoji: '😷',
    message: 'Sick',
    expiration_setting: 'today'
  },
  {
    emoji: '🌴',
    message: 'Vacationing',
    expiration_setting: 'this_week'
  }
]

type Expiration = OrganizationsOrgSlugMembersMeStatusesPostRequest['expiration_setting']

export function UpdateStatusDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: currentUser } = useGetCurrentUser()
  const { isLoading: isLoadingMember } = useGetOrganizationMember({
    username: currentUser?.username ?? ''
  })

  return (
    <>
      <Dialog.Root aria-describedby='Update your status' open={open} onOpenChange={onOpenChange} size='lg' align='top'>
        <Dialog.Header className='pb-0'>
          <Dialog.Title>Update status</Dialog.Title>
        </Dialog.Header>

        {isLoadingMember && (
          <Dialog.Content className='p-24'>
            <FullPageLoading />
          </Dialog.Content>
        )}

        {!isLoadingMember && <StatusPickerContent onOpenChange={onOpenChange} />}
      </Dialog.Root>
    </>
  )
}

function StatusPickerContent({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const { data: member } = useGetOrganizationMember({ username: currentUser?.username ?? '' })
  const memberStatus = member?.status
  const memberStatusIsExpired = useStatusIsExpired(memberStatus)
  const currentStatus = memberStatusIsExpired ? null : memberStatus

  const createStatus = useCreateStatus()
  const updateStatus = useUpdateStatus()
  const deleteStatus = useDeleteStatus()
  const { data: recentStatuses } = useRecentStatuses()

  const suggestedStatuses = useMemo(() => {
    let presets = [
      ...(recentStatuses?.filter((status) => status.expiration_setting !== 'custom') ?? []),
      ...DEFAULT_STATUSES
    ]

    return uniqBy(presets, (preset) => preset.message)
      .slice(0, 5)
      .reverse()
  }, [recentStatuses])

  const defaultState = {
    emoji: '💬',
    message: '',
    expiration_setting: '30m' as Expiration,
    expires_at: undefined,
    pause_notifications: false
  }

  const [emoji, setEmoji] = useState(currentStatus?.emoji ?? defaultState.emoji)
  const [message, setMessage] = useState(currentStatus?.message ?? defaultState.message)
  const [expiresIn, setExpiresIn] = useState<Expiration | null>(
    currentStatus?.expiration_setting ?? defaultState.expiration_setting
  )
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    currentStatus?.expires_at ? new Date(currentStatus.expires_at) : defaultState.expires_at
  )
  const [willPauseNotifications, setWillPauseNotifications] = useState(
    (currentUser?.notifications_paused && currentStatus?.pause_notifications) ?? defaultState.pause_notifications
  )
  const [customExpirationCalendarDialogOpen, setCustomExpirationCalendarDialogOpen] = useState(false)
  const hasStatus = Boolean(currentStatus)
  const isEmojiDirty = hasStatus ? emoji !== currentStatus?.emoji : emoji !== defaultState.emoji
  const isMessageDirty = hasStatus ? message !== currentStatus?.message : message !== defaultState.message

  const isExpirationDirty = hasStatus
    ? (expiresIn === 'custom' && expiresAt?.toISOString() !== currentStatus?.expires_at) ||
      expiresIn !== currentStatus?.expiration_setting
    : expiresAt || expiresIn !== defaultState.expiration_setting
  const isWillPauseNotificationsDirty = hasStatus
    ? currentUser?.notifications_paused && currentStatus?.pause_notifications
      ? !willPauseNotifications
      : willPauseNotifications
    : willPauseNotifications !== defaultState.pause_notifications
  const isDirty = isEmojiDirty || isMessageDirty || isExpirationDirty || isWillPauseNotificationsDirty
  const { data: notificationSchedule } = useGetNotificationSchedule()

  const timeRemaining = getTimeRemaining(currentStatus?.expires_at)

  function resetStateToDefaults() {
    setEmoji(defaultState.emoji)
    setMessage(defaultState.message)
    setExpiresIn(defaultState.expiration_setting)
    setExpiresAt(defaultState.expires_at)
    setWillPauseNotifications(defaultState.pause_notifications)
  }

  function onSave() {
    if (isDirty) {
      if (!currentStatus) {
        if (!expiresIn) return
        createStatus.mutate({
          org: `${scope}`,
          emoji,
          message,
          expiration_setting: expiresIn,
          expires_at: expiresIn === 'custom' ? expiresAt?.toISOString() : undefined,
          pause_notifications: willPauseNotifications
        })
      } else {
        updateStatus.mutate({
          org: `${scope}`,
          emoji: isEmojiDirty ? emoji : undefined,
          message: isMessageDirty ? message : undefined,
          expiration_setting: isExpirationDirty && expiresIn ? expiresIn : undefined,
          expires_at: expiresIn === 'custom' ? expiresAt?.toISOString() : undefined,
          pause_notifications: willPauseNotifications
        })
      }

      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog.Content className='p-0'>
        <div className='scrollbar-hide flex max-h-[40vh] flex-1 flex-col overflow-hidden overflow-y-auto px-2 py-3'>
          {suggestedStatuses?.map((preset) => (
            <button
              key={`${preset.message}`}
              className='hover:bg-tertiary flex h-10 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-3 text-sm'
              onClick={() => {
                if (currentStatus) {
                  updateStatus.mutate({
                    org: `${scope}`,
                    emoji: preset.emoji,
                    message: preset.message,
                    expiration_setting: preset.expiration_setting,
                    pause_notifications: willPauseNotifications
                  })
                } else {
                  createStatus.mutate({
                    org: `${scope}`,
                    emoji: preset.emoji,
                    message: preset.message,
                    expiration_setting: preset.expiration_setting,
                    pause_notifications: willPauseNotifications
                  })
                }

                setEmoji(preset.emoji)
                setMessage(preset.message)
                setExpiresIn(preset.expiration_setting)

                onOpenChange(false)
              }}
            >
              <UIText className='flex h-6 w-6 items-center justify-center text-center font-["emoji"]'>
                {preset.emoji}
              </UIText>
              <span className='line-clamp-1'>{preset.message}</span>
              <span className='text-tertiary text-sm'>{preset.expiration_setting.replace('_', ' ')}</span>
            </button>
          ))}
        </div>

        <div className='flex flex-col gap-3 border-t p-4'>
          <div className='relative'>
            <div className='absolute left-1.5 top-1.5 z-[1]'>
              <ReactionPicker
                onReactionSelect={(reaction) => {
                  if (!isStandardReaction(reaction)) return

                  setEmoji(reaction.native)
                }}
                trigger={
                  <Button
                    variant='plain'
                    accessibilityLabel='Update status emoji'
                    className='group/emoji'
                    iconOnly={<span className='text-lg'>{emoji}</span>}
                  />
                }
              />
            </div>
            <TextField
              autoFocus={!isMobile}
              value={message}
              onChange={setMessage}
              placeholder='What’s your status?'
              additionalClasses='bg-transparent rounded-md text-[15px] h-10.5 dark:bg-transparent pl-12 pr-24'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSave()
                }
              }}
            />
            {message && (
              <div className='absolute right-1.5 top-1.5 z-[1]'>
                <Select
                  options={[
                    { value: '30m', label: '30m' },
                    { value: '1h', label: '1h' },
                    { value: '4h', label: '4h' },
                    { value: 'today', label: 'Today' },
                    { value: 'this_week', label: 'This week' },
                    { value: 'custom', label: 'Custom' }
                  ]}
                  align='end'
                  value={expiresIn || '30m'}
                  onChange={(value) => {
                    if (value === 'custom') {
                      setCustomExpirationCalendarDialogOpen(true)
                      return
                    }
                    setExpiresIn(value as Expiration)
                    setExpiresAt(defaultState.expires_at)
                  }}
                  popoverWidth='auto'
                >
                  <Button variant='plain' rightSlot={<ChevronDownIcon />}>
                    {expiresIn && expiresIn === 'custom'
                      ? getTimeRemaining(expiresAt?.toISOString())
                      : (expiresIn?.replace('_', ' ') ?? timeRemaining)}
                  </Button>
                </Select>
              </div>
            )}
          </div>

          <div className='flex items-start justify-between'>
            <div className='mt-1.5 flex flex-1 items-center gap-1'>
              <div className='flex flex-1 justify-between gap-3'>
                <label className='flex items-center gap-1'>
                  <Checkbox checked={willPauseNotifications} onChange={setWillPauseNotifications} />
                  <UIText weight='font-medium' className='ml-2'>
                    Pause notifications
                  </UIText>
                  <Tooltip
                    label='Silence notifications while this status is active. Anything you miss will be in your inbox to
                    review later.'
                  >
                    <span>
                      <InformationIcon className='text-tertiary hover:text-primary' />
                    </span>
                  </Tooltip>
                </label>
                {willPauseNotifications && (
                  <UIText tertiary>
                    <Link href='/me/settings#notification-schedule' className='text-blue-500 hover:underline'>
                      {notificationSchedule?.type === 'none' ? 'Set up a schedule' : 'Edit schedule'}
                    </Link>
                  </UIText>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog.Content>

      <Dialog.Footer className='border-t-0 pt-0'>
        <Dialog.LeadingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </Dialog.LeadingActions>
        <Dialog.TrailingActions>
          {hasStatus && !isDirty && (
            <Button
              variant='flat'
              type='submit'
              onClick={() => {
                deleteStatus.mutate({ org: `${scope}` })
                resetStateToDefaults()
                onOpenChange(false)
              }}
            >
              Clear current status
            </Button>
          )}

          {(isDirty || !hasStatus) && (
            <Button
              variant='primary'
              type='submit'
              onClick={onSave}
              disabled={updateStatus.isPending || !isDirty || !message}
            >
              Update status
            </Button>
          )}
        </Dialog.TrailingActions>
      </Dialog.Footer>

      <CustomExpirationCalendarDialog
        open={customExpirationCalendarDialogOpen}
        onOpenChange={setCustomExpirationCalendarDialogOpen}
        initialDate={expiresAt ?? addHours(new Date(), 1)}
        onChange={(date) => {
          setExpiresIn('custom')
          setExpiresAt(date)
        }}
      />
    </>
  )
}

function CustomExpirationCalendarDialog({
  open,
  onOpenChange,
  initialDate,
  onChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate: Date
  onChange: (date: Date) => void
}) {
  const onSelectExpiration = (date: Date) => {
    onChange(date)
    onOpenChange(false)
  }

  const [date, setDate] = useState<Date>(initialDate)

  return (
    <Dialog.Root
      size='fit'
      open={open}
      onOpenChange={onOpenChange}
      visuallyHiddenTitle='Custom status expiration date'
      visuallyHiddenDescription='Select a date for your status to expire'
    >
      <Dialog.Content className='place-self-center p-6'>
        <div className='flex h-full w-full flex-col gap-3'>
          <DateAndTimePicker value={date} onChange={setDate} />
          <Button
            fullWidth
            disabled={date < new Date()}
            className='py-1'
            variant='primary'
            onClick={() => {
              onSelectExpiration(date)
            }}
          >
            {date < new Date() ? 'Select future time' : 'Set expiration'}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
