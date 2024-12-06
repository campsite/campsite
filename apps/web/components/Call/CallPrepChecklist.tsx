import { useState } from 'react'

import { Button } from '@campsite/ui/Button'
import { useBreakpoint, useIsDesktopApp } from '@campsite/ui/hooks'
import { CheckIcon } from '@campsite/ui/Icons'
import { Popover, PopoverAnchor, PopoverContent, PopoverPortal } from '@campsite/ui/Popover'
import { UIText } from '@campsite/ui/Text'
import { cn, CONTAINER_STYLES } from '@campsite/ui/utils'

import { useAVPermissionState } from '@/hooks/useAVPermissionState'
import { useHasPermissionsAPI } from '@/hooks/useHasPermissionsApi'

export function CallPrepChecklist() {
  const { hasPermissionsAPI } = useHasPermissionsAPI()
  const isDesktopApp = useIsDesktopApp()

  if (!hasPermissionsAPI || isDesktopApp) return null

  return (
    <div className='flex w-full justify-center'>
      <div className='bg-tertiary flex max-w-[400px] flex-1 flex-col gap-4 rounded-lg p-3'>
        <div>
          <UIText weight='font-medium'>Pre-call checklist</UIText>
          <UIText size='text-xs' tertiary>
            Complete these before joining for a great experience
          </UIText>
        </div>
        <MicrophonePermissionItem />
        <CameraPermissionItem />
      </div>
    </div>
  )
}

function MicrophonePermissionItem() {
  const permissionState = useAVPermissionState('microphone')

  function requestPermission() {
    return navigator.mediaDevices.getUserMedia({ audio: true })
  }

  return (
    <PermissionItem
      permissionState={permissionState}
      requestPermission={requestPermission}
      title='Microphone permission'
      description='Required for others to hear you'
    />
  )
}

function CameraPermissionItem() {
  const permissionState = useAVPermissionState('camera')

  function requestPermission() {
    return navigator.mediaDevices.getUserMedia({ video: true })
  }

  return (
    <PermissionItem
      permissionState={permissionState}
      requestPermission={requestPermission}
      title='Camera permission'
      description='Required for others to see you'
    />
  )
}

interface PermissionItemProps {
  permissionState: PermissionState | undefined
  requestPermission: () => Promise<MediaStream>
  title: string
  description: string
}

function PermissionItem({ permissionState, requestPermission, title, description }: PermissionItemProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const isSm = useBreakpoint('sm')

  function requestPermissionOrOpenPopover() {
    requestPermission().catch((e) => {
      if (e.name === 'NotAllowedError') setIsPopoverOpen(true)
    })
  }

  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-3'>
        <PermissionStateIcon permissionState={permissionState} />
        <div className='flex flex-col'>
          <UIText weight='font-medium'>{title}</UIText>
          <UIText size='text-xs' tertiary>
            {description}
          </UIText>
        </div>
      </div>
      {permissionState !== 'granted' && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverAnchor>
            <Button variant='flat' onClick={requestPermissionOrOpenPopover} fullWidth={!isSm}>
              Grant
            </Button>
          </PopoverAnchor>
          <PopoverPortal>
            <PopoverContent
              sideOffset={8}
              className={cn(
                CONTAINER_STYLES.base,
                CONTAINER_STYLES.shadows,
                'bg-elevated dark w-[250px] rounded-lg p-2'
              )}
              align='end'
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className='flex max-h-[--radix-popper-available-height] flex-col p-2'>
                <UIText size='text-sm'>You denied this permission. Enable from browser settings.</UIText>
              </div>
            </PopoverContent>
          </PopoverPortal>
        </Popover>
      )}
    </div>
  )
}

function PermissionStateIcon({ permissionState }: Pick<PermissionItemProps, 'permissionState'>) {
  if (permissionState === 'granted') {
    return <CheckIcon className='text-green-500' />
  }

  return (
    <div className='flex h-[20px] w-[20px] items-center justify-center'>
      <div className='h-2 w-2 rounded-full bg-amber-500' />
    </div>
  )
}
