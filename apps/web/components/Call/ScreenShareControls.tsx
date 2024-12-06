import { useEffect, useState } from 'react'
import {
  selectIsLocalScreenShared,
  selectIsSomeoneScreenSharing,
  useHMSActions,
  useHMSStore
} from '@100mslive/react-sdk'
import { Popover, PopoverAnchor, PopoverContent } from '@radix-ui/react-popover'
import { systemPreferences } from '@todesktop/client-core'
import { isMacOs, isWindows } from 'react-device-detect'

import { Button, CONTAINER_STYLES, LayeredHotkeys, StreamIcon } from '@campsite/ui'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { DesktopPermissionsDescription } from '@/components/Call/DesktopPermissionsDescription'
import { useAppFocused } from '@/hooks/useAppFocused'

import { DesktopScreenShareSourcesDialog } from './DesktopScreenShareSourcesDialog'
import { PermissionsPrompt } from './PermissionsPrompt'

export function ScreenShareControls() {
  const isDesktop = useIsDesktopApp()

  // Hide screen share controls if the browser does not support required APIs
  if (typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
    return null
  }

  if (isDesktop) {
    return <DesktopScreenShareControls />
  }
  return <WebScreenShareControls />
}

function WebScreenShareControls() {
  const hmsActions = useHMSActions()
  const isLocalScreenSharing = useHMSStore(selectIsLocalScreenShared)
  const isSomeoneElseScreenSharing = useHMSStore(selectIsSomeoneScreenSharing) && !isLocalScreenSharing

  function toggleScreenShare() {
    hmsActions.setScreenShareEnabled(!isLocalScreenSharing).catch(ignoreCantAccessCaptureDeviceError)
  }

  return (
    <>
      <LayeredHotkeys
        keys='mod+shift+s'
        options={{ enabled: !isSomeoneElseScreenSharing }}
        callback={toggleScreenShare}
      />

      <Button
        variant={isLocalScreenSharing ? 'none' : 'base'}
        className={cn({ 'bg-blue-500 text-gray-50 hover:before:opacity-100': isLocalScreenSharing })}
        onClick={toggleScreenShare}
        iconOnly={<StreamIcon strokeWidth='2' size={24} />}
        accessibilityLabel='Toggle screen sharing'
        disabled={isSomeoneElseScreenSharing}
        tooltip={isSomeoneElseScreenSharing ? 'Someone else is sharing their screen' : 'Share your screen'}
        round
        size='large'
      />
    </>
  )
}

const getDesktopScreenShareStatus = async () => {
  // getMediaAccessStatus is not supported on Linux, assume permission is granted
  // https://www.electronjs.org/docs/latest/api/system-preferences#systempreferencesgetmediaaccessstatusmediatype-windows-macos
  if (!isMacOs && !isWindows) return true

  const status = await systemPreferences.getMediaAccessStatus('screen')

  return status !== 'denied' && status !== 'restricted'
}

function DesktopScreenShareControls() {
  const hmsActions = useHMSActions()
  const isLocalScreenSharing = useHMSStore(selectIsLocalScreenShared)
  const isSomeoneElseScreenSharing = useHMSStore(selectIsSomeoneScreenSharing) && !isLocalScreenSharing
  const [hasPermission, setHasPermission] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)

  const appFocused = useAppFocused()

  useEffect(() => {
    if (appFocused) {
      getDesktopScreenShareStatus().then(setHasPermission)
    }
  }, [appFocused])

  async function toggleScreenShare() {
    if (isLocalScreenSharing) {
      hmsActions.setScreenShareEnabled(!isLocalScreenSharing).catch(ignoreCantAccessCaptureDeviceError)
    } else if (hasPermission) {
      setSourcesOpen(true)
    } else {
      setPermissionsOpen(true)
    }
  }

  return (
    <>
      <LayeredHotkeys
        keys='mod+shift+s'
        options={{ enabled: !isSomeoneElseScreenSharing }}
        callback={toggleScreenShare}
      />

      <Popover open={permissionsOpen} onOpenChange={setPermissionsOpen}>
        <PopoverAnchor>
          <Button
            variant={isLocalScreenSharing ? 'none' : 'base'}
            className={cn({ 'bg-blue-500 text-gray-50 hover:before:opacity-100': isLocalScreenSharing })}
            onClick={toggleScreenShare}
            iconOnly={<StreamIcon strokeWidth='2' size={24} />}
            accessibilityLabel='Toggle screen sharing'
            disabled={isSomeoneElseScreenSharing}
            tooltip={isSomeoneElseScreenSharing ? 'Someone else is sharing their screen' : 'Share screen'}
            tooltipShortcut={isSomeoneElseScreenSharing ? undefined : 'mod+shift+s'}
            round
            size='large'
          />
        </PopoverAnchor>
        <PopoverContent
          className={cn(
            CONTAINER_STYLES.base,
            CONTAINER_STYLES.shadows,
            'bg-elevated w-[300px] overflow-hidden rounded-lg'
          )}
        >
          {permissionsOpen && (
            <PermissionsPrompt
              title='Enable screen capture permissions'
              description={
                <DesktopPermissionsDescription
                  action='share your screen'
                  name='Screen Recording'
                  href={isMacOs && 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'}
                />
              }
            />
          )}
        </PopoverContent>
      </Popover>

      <DesktopScreenShareSourcesDialog
        open={sourcesOpen}
        onOpenChanged={setSourcesOpen}
        onSelectSource={async (source) => {
          navigator.mediaDevices.getDisplayMedia = () =>
            navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                // @ts-ignore
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: source.id,
                  minFrameRate: 10,
                  maxFrameRate: 30
                }
              }
            })

          hmsActions.setScreenShareEnabled(true).catch(ignoreCantAccessCaptureDeviceError)
          setSourcesOpen(false)
        }}
      />
    </>
  )
}

function ignoreCantAccessCaptureDeviceError(e: any) {
  if ('code' in e && (e.code === 3001 || e.code === 3011)) return
  throw e
}
