import { useEffect, useState } from 'react'
import { systemPreferences } from '@todesktop/client-core'
import { isMacOs, isWindows } from 'react-device-detect'

import { useIsDesktopApp } from '@campsite/ui/hooks'

import { useHasPermissionsAPI } from '@/hooks/useHasPermissionsApi'

import { useAppFocused } from './useAppFocused'

export function useAVPermissionState(type: 'camera' | 'microphone') {
  const hasPermissionsAPI = useHasPermissionsAPI()
  const [permissionState, setPermissionState] = useState<PermissionState>()
  const isDesktopApp = useIsDesktopApp()

  // this rechecks permission on focus change
  const appFocused = useAppFocused()

  useEffect(() => {
    if (!hasPermissionsAPI || isDesktopApp) return
    const checkPermission = async () => {
      const status = await navigator.permissions.query({
        // @ts-ignore: FireFox doesn't support camera/microphone. use exceptions to switch to fallback check.
        name: type
      })

      const updateStatus = () => setPermissionState(status.state)

      status.onchange = updateStatus
      updateStatus()
    }

    checkPermission()
  }, [hasPermissionsAPI, isDesktopApp, type])

  useEffect(() => {
    if (hasPermissionsAPI || !appFocused || isDesktopApp) return
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: type === 'microphone',
          video: type === 'camera'
        })

        stream.getTracks().forEach((track) => track.stop())
        setPermissionState('granted')
      } catch (error) {
        setPermissionState('denied')
      }
    }

    checkPermission()
  }, [appFocused, hasPermissionsAPI, isDesktopApp, type])

  useEffect(() => {
    if (!isDesktopApp || !appFocused) return

    if (isMacOs) {
      systemPreferences.askForMediaAccess(type).then((wasGranted) => {
        setPermissionState(wasGranted ? 'granted' : 'denied')
      })
    }

    if (isWindows) {
      systemPreferences.getMediaAccessStatus(type).then((status) => {
        setPermissionState(status === 'granted' ? 'granted' : 'denied')
      })
    }
  }, [appFocused, isDesktopApp, type])

  return permissionState
}
