/* eslint-disable max-lines */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  DeviceType,
  HMSNotificationTypes,
  HMSPeer,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectIsLocalScreenShared,
  selectIsLocalVideoEnabled,
  selectPeers,
  selectPeerScreenSharing,
  useDevices,
  useHMSActions,
  useHMSNotifications,
  useHMSStore
} from '@100mslive/react-sdk'
import { AnimatePresence, m } from 'framer-motion'
import { useAtomValue } from 'jotai'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { isMacOs, isWindows } from 'react-device-detect'
import { useDebouncedCallback } from 'use-debounce'
import useSound from 'use-sound'

import {
  ANIMATION_CONSTANTS,
  Button,
  ChevronDownIcon,
  CONTAINER_STYLES,
  DismissibleLayer,
  LayeredHotkeys,
  LoadingSpinner,
  MicrophoneIcon,
  MicrophoneMuteIcon,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Select,
  SelectPopover,
  UIText,
  VideoCameraIcon,
  VideoCameraOffIcon
} from '@campsite/ui'
import { useBreakpoint, useIsDesktopApp } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { callChatOpenAtom, callRoomStateAtom, titleAtom } from '@/atoms/call'
import { AutoplayBlockedError } from '@/components/Call/AutoplayBlockedError'
import { CallChat } from '@/components/Call/CallChat'
import { CallPeer } from '@/components/Call/CallPeer'
import { CallPrepChecklist } from '@/components/Call/CallPrepChecklist'
import { DesktopPermissionsDescription } from '@/components/Call/DesktopPermissionsDescription'
import { InviteParticipantsPopover } from '@/components/Call/InviteParticipantsPopover'
import { LeftCall } from '@/components/Call/LeftCall'
import { LoggedOutPrompt } from '@/components/Call/LoggedOutPrompt'
import { ScreenShareWithPeers } from '@/components/Call/ScreenShareWithPeers'
import { StopScreensharingButton } from '@/components/Call/StopScreensharingButton'
import { ToggleCallChatButton } from '@/components/Call/ToggleCallChatButton'
import { useLeaveCall } from '@/components/Call/useLeaveCall'
import { useAVPermissionState } from '@/hooks/useAVPermissionState'
import { useCallDeviceToasts } from '@/hooks/useCallDeviceToasts'
import { useCallRoomSubscriptions } from '@/hooks/useCallRoomSubscriptions'
import { useGetCallRoom } from '@/hooks/useGetCallRoom'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

import { CallToasts } from './CallToasts'
import { PermissionsPrompt } from './PermissionsPrompt'
import { RecordingButton } from './RecordingButton'
import { ScreenShareControls } from './ScreenShareControls'

// Must import dynamically because HMSKrispPlugin contains code that can't be run on the server.
const NoiseCancellation = dynamic(
  () => import('@/components/Call/NoiseCancellation').then((mod) => mod.NoiseCancellation),
  {
    ssr: false
  }
)

export function FullPageActiveCallContainer() {
  const isDesktopApp = useIsDesktopApp()

  useCallDeviceToasts()

  return (
    <DismissibleLayer>
      <div className='drag bg-primary dark fixed inset-x-0 top-0 flex h-full flex-1 flex-col overflow-hidden p-2'>
        <div
          className={cn('flex min-h-[42px] items-center gap-2 pb-1', {
            'pl-3': !isDesktopApp,
            'py-1.5 pl-20': isDesktopApp && isMacOs
          })}
        >
          <ActiveCallHeader />
        </div>

        <div className='no-drag flex flex-1 flex-col overflow-hidden'>
          <ActiveCall />
        </div>
      </div>
    </DismissibleLayer>
  )
}

function ActiveCallHeader() {
  const title = useAtomValue(titleAtom)

  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex flex-1 select-none items-center gap-1'>
        <UIText element='span' weight='font-semibold'>
          {title}
        </UIText>
        <InviteParticipantsPopover />
      </div>
    </div>
  )
}

function ActiveCall() {
  const callRoomState = useAtomValue(callRoomStateAtom)
  const isGreaterThanSm = useBreakpoint('sm')
  const isMobile = !isGreaterThanSm
  const [playJoinSound] = useSound('/sounds/call-start.mp3', { volume: 0.2 })
  const callChatOpen = useAtomValue(callChatOpenAtom)

  const router = useRouter()
  const { data: callRoom } = useGetCallRoom({ callRoomId: router.query.callRoomId as string })

  useCallRoomSubscriptions({ callRoom })

  useEffect(() => {
    if (callRoomState === 'Connected') {
      playJoinSound()
    }
  }, [callRoomState, playJoinSound])

  if (callRoomState === 'Left') {
    return <LeftCall />
  }

  if (callRoomState === 'Login') {
    return (
      <>
        <CallPrepChecklist />
        <LoggedOutPrompt />
      </>
    )
  }

  if (callRoomState !== 'Connected') {
    return (
      <div className='flex h-full items-center justify-center'>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <div className='relative m-2 flex flex-1 items-center justify-center gap-3 overflow-hidden py-1 sm:m-0'>
        <Video />
        <AutoplayBlockedError />
        <CallToasts className='absolute top-6' />
        <CallChat />
      </div>
      <div className='grid grid-cols-2 gap-y-4 p-2 pb-1 sm:grid-cols-3'>
        {!(isMobile && callChatOpen) && (
          <>
            <div className='col-span-2 sm:col-span-3'>
              <StopScreensharingButton />
            </div>
            <div className='col-span-2 flex items-center justify-start sm:col-span-1'>
              <RecordingButton />
            </div>
            <div className='col-span-2 flex items-center justify-center sm:hidden'>
              <LeaveCallButton />
            </div>
          </>
        )}
        <div className='col-span-1 flex items-center justify-start gap-4 self-center sm:justify-center'>
          <AudioControls />
          <VideoControls />
          <ScreenShareControls />
          <div className='ml-3 hidden sm:block'>
            <LeaveCallButton />
          </div>
        </div>
        <div className='col-span-1 justify-self-end'>
          <ToggleCallChatButton />
        </div>
      </div>
      {isMobile && <div className='pb-safe-offset-2 h-0' />}
      <NoiseCancellation />
    </>
  )
}

function Video() {
  const screenSharingPeer = useHMSStore(selectPeerScreenSharing)
  const [playPeerJoinedSound] = useSound('/sounds/call-peer-join.mp3', { volume: 0.2 })
  const [playPeerLeftSound] = useSound('/sounds/call-peer-leave.mp3', { volume: 0.2 })
  const debouncedPlayPeerLeftSound = useDebouncedCallback(playPeerLeftSound, 3000, { leading: true })

  const peerJoinedNotification = useHMSNotifications(HMSNotificationTypes.PEER_JOINED)
  const peerLeftNotification = useHMSNotifications(HMSNotificationTypes.PEER_LEFT)

  useEffect(() => {
    if (peerJoinedNotification && !peerJoinedNotification.data.isLocal) playPeerJoinedSound()
    if (peerLeftNotification && !peerLeftNotification.data.isLocal) debouncedPlayPeerLeftSound()
  }, [peerJoinedNotification, peerLeftNotification, playPeerJoinedSound, debouncedPlayPeerLeftSound])

  if (screenSharingPeer) {
    return <ScreenShareWithPeers />
  }

  return <Peers />
}

function peerSize(count: number, containerWidth: number, containerHeight: number) {
  if (count === 1) {
    return {
      width: '100%',
      height: '100%'
    }
  }

  const peerGapPx = 8
  const preferredAspectRatio = 4 / 3

  let best = {
    width: 0,
    height: 0,
    columns: 0,
    rows: 0,
    aspectRatio: 0
  }

  for (let columns = 1; columns <= count; columns++) {
    const rows = Math.ceil(count / columns)
    const width = containerWidth / columns - peerGapPx * (columns - 1)
    const height = containerHeight / rows - peerGapPx * (rows - 1)
    const aspectRatio = width / height

    if (
      best.aspectRatio === 0 ||
      (Math.abs(aspectRatio - preferredAspectRatio) < Math.abs(best.aspectRatio - preferredAspectRatio) &&
        aspectRatio > 0.5)
    ) {
      best = { width, height, columns, rows, aspectRatio }
    } else {
      break
    }
  }

  return {
    width: `calc(${100 / best.columns}% - ${peerGapPx}px)`,
    height: `calc(${100 / best.rows}% - ${peerGapPx}px)`
  }
}

function Peers() {
  const peers = useHMSStore(selectPeers)
  const containerRef = useRef<HTMLDivElement>(null)

  const isGreaterThanSm = useBreakpoint('sm')
  const PEERS_PER_PAGE = isGreaterThanSm ? 12 : 6
  const [activePage, setActivePage] = useState(0)
  const [visiblePeers, setVisiblePeers] = useState<HMSPeer[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [peerWidth, setPeerWidth] = useState('100%')
  const [peerHeight, setPeerHeight] = useState('100%')
  const [localMinimized, setLocalMinimized] = useState(true)

  const [minimizedWidth, setMinimizedWidth] = useState('100%')
  const [minimizedHeight, setMinimizedHeight] = useState('100%')

  useEffect(() => {
    const pages = Math.ceil(peers.length / PEERS_PER_PAGE)

    setTotalPages(pages)

    // if the local peer is minimized, it needs to be last in the order to appear on top of other calls in the z-index stack
    const slicedPeers = peers.slice(activePage * PEERS_PER_PAGE, (activePage + 1) * PEERS_PER_PAGE)

    if (localMinimized) {
      setVisiblePeers([...slicedPeers.filter((p) => !p.isLocal), slicedPeers.find((p) => p.isLocal)!].filter(Boolean))
    } else {
      setVisiblePeers(slicedPeers)
    }
  }, [peers, activePage, localMinimized, PEERS_PER_PAGE])

  const totalVisiblePeers = localMinimized ? visiblePeers.filter((p) => !p.isLocal).length : visiblePeers.length

  useLayoutEffect(() => {
    let resizeObserver: ResizeObserver
    const node = containerRef.current

    const updateDimensions = () => {
      if (!node) return

      const size = { width: node.offsetWidth, height: node.offsetHeight }

      const { width, height } = peerSize(totalVisiblePeers, size.width, size.height)

      setPeerWidth(width)
      setPeerHeight(height)

      if (localMinimized) {
        // set the minimized peer size to 25% of the container width, up to 200px
        const mw = Math.min(node.offsetWidth * 0.25, 200)
        const mh = mw * (3 / 4)

        setMinimizedWidth(`${mw}px`)
        setMinimizedHeight(`${mh}px`)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    if (node) {
      resizeObserver = new ResizeObserver(() => updateDimensions())
      resizeObserver.observe(node)
    }

    return () => {
      window.removeEventListener('resize', updateDimensions)

      if (resizeObserver && node) {
        resizeObserver.unobserve(node!)
      }
    }
  }, [localMinimized, totalVisiblePeers, visiblePeers])

  return (
    <div className='relative flex h-full w-full flex-col'>
      {localMinimized && totalVisiblePeers === 0 && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg'>
          <UIText weight='font-medium' quaternary>
            Waiting for others to join...
          </UIText>
        </div>
      )}

      <div
        ref={containerRef}
        className={cn('relative isolate flex h-full w-full flex-wrap content-center justify-center gap-2')}
      >
        {visiblePeers.map((peer, i) => (
          <CallPeer
            key={peer.id + `${i}`}
            peer={peer}
            onMinimize={() => setLocalMinimized(!localMinimized)}
            minimized={localMinimized}
            width={peer.isLocal && localMinimized ? minimizedWidth : peerWidth}
            height={peer.isLocal && localMinimized ? minimizedHeight : peerHeight}
          />
        ))}
      </div>

      {/* peer pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center pb-2'>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setActivePage(i)}
              className='group/pagination-button flex items-center justify-center p-1.5'
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full transition-colors group-hover/pagination-button:bg-white',
                  i === activePage ? 'bg-white' : 'bg-white/50'
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LeaveCallButton() {
  const isSm = useBreakpoint('sm')
  const leaveCall = useLeaveCall()
  const isLocalScreenSharing = useHMSStore(selectIsLocalScreenShared)
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const { data: currentUser } = useGetCurrentUser()
  const [playLeaveSound] = useSound('/sounds/call-end.mp3', {
    volume: 0.2,
    onend: () => {
      if (currentUser?.logged_in) window.close()
    }
  })

  function handleLeave() {
    playLeaveSound()
    leaveCall()
  }

  return (
    <>
      <LayeredHotkeys
        keys='mod+shift+h'
        callback={handleLeave}
        options={{ preventDefault: true, enableOnContentEditable: true }}
      />

      <Button
        fullWidth={!isSm}
        variant='destructive'
        tooltipShortcut='⌘+shift+h'
        onClick={handleLeave}
        tooltip='Leave call'
        className={cn({ 'bg-red-800': isLocalScreenSharing })}
        size='large'
        disabled={!isConnected}
      >
        Leave
      </Button>
    </>
  )
}

function AudioControls() {
  const containerRef = useRef<HTMLDivElement>(null)
  const hmsActions = useHMSActions()
  const [open, setOpen] = useState(false)
  const permissionState = useAVPermissionState('microphone')
  const audioEnabled = useHMSStore(selectIsLocalAudioEnabled) && permissionState !== 'denied'

  function toggleAudio() {
    if (permissionState === 'denied') {
      setOpen(true)
    } else {
      hmsActions.setLocalAudioEnabled(!audioEnabled).catch(ignoreCantAccessCaptureDeviceError)
    }
  }

  return (
    <div ref={containerRef} className='flex items-center'>
      <LayeredHotkeys keys='mod+shift+a' callback={toggleAudio} />

      <Button
        variant={audioEnabled ? 'none' : 'base'}
        className={cn({ 'bg-green-500 text-gray-50 hover:before:opacity-100': audioEnabled })}
        onClick={toggleAudio}
        iconOnly={
          audioEnabled ? <MicrophoneIcon strokeWidth='2' size={24} /> : <MicrophoneMuteIcon strokeWidth='2' size={24} />
        }
        tooltip='Toggle audio'
        tooltipShortcut='mod+shift+a'
        accessibilityLabel='Toggle audio'
        round
        size='large'
      />
      <Popover open={open} onOpenChange={setOpen} sheetBreakpoint='sm'>
        <PopoverTrigger>
          <ChevronDownIcon className='text-quaternary hover:text-tertiary' />
        </PopoverTrigger>
        <AnimatePresence>
          <PopoverPortal>
            <PopoverContent
              sideOffset={16}
              className={cn(
                CONTAINER_STYLES.base,
                CONTAINER_STYLES.shadows,
                'bg-elevated dark overflow-hidden rounded-lg sm:w-[300px]'
              )}
            >
              <m.div {...ANIMATION_CONSTANTS}>
                {permissionState === 'granted' ? <AudioControlsPicker /> : <AudioControlsPermissions />}
              </m.div>
            </PopoverContent>
          </PopoverPortal>
        </AnimatePresence>
      </Popover>
    </div>
  )
}

function AudioControlsPicker() {
  const { allDevices, selectedDeviceIDs, updateDevice } = useDevices()
  const { audioInput: inputDevices, audioOutput: outputDevices } = allDevices
  const { audioInput: selectedInputDeviceID, audioOutput: selectedOutputDeviceID } = selectedDeviceIDs
  const inputOptions = inputDevices?.map((device) => ({ label: device.label, value: device.deviceId })) || []
  const outputOptions = outputDevices?.map((device) => ({ label: device.label, value: device.deviceId })) || []

  return (
    <div className='flex max-h-[--radix-popper-available-height] flex-col'>
      <div className='flex flex-col gap-5 p-3'>
        <div className='flex flex-col gap-1.5'>
          <UIText size='text-xs' weight='font-medium'>
            Audio input
          </UIText>
          <Select
            options={inputOptions}
            value={selectedInputDeviceID || ''}
            onChange={(deviceId) => updateDevice({ deviceType: DeviceType.audioInput, deviceId })}
            dark
          />
        </div>
        <div className='flex flex-col gap-1.5'>
          <UIText size='text-xs' weight='font-medium'>
            Audio output
          </UIText>
          <Select
            options={outputOptions}
            value={selectedOutputDeviceID || ''}
            onChange={(deviceId) => updateDevice({ deviceType: DeviceType.audioOutput, deviceId })}
            dark
          />
        </div>
      </div>
    </div>
  )
}

function AudioControlsPermissions() {
  const isDesktop = useIsDesktopApp()

  return (
    <PermissionsPrompt
      title='Enable audio permissions'
      description={
        isDesktop ? (
          <DesktopPermissionsDescription
            action='share your audio'
            name='Microphone'
            href={
              isMacOs
                ? 'https://support.apple.com/guide/mac-help/control-access-to-the-microphone-on-mac-mchla1b1e1fe/mac'
                : isWindows &&
                  'https://support.microsoft.com/en-us/windows/windows-camera-microphone-and-privacy-a83257bc-e990-d54a-d212-b5e41beba857'
            }
          />
        ) : (
          'To share your audio, navigate to your browser settings and enable "Microphone" permissions.'
        )
      }
    />
  )
}

function VideoControls() {
  const hmsActions = useHMSActions()
  const videoEnabled = useHMSStore(selectIsLocalVideoEnabled)
  const [open, setOpen] = useState(false)
  const permissionState = useAVPermissionState('camera')

  function toggleVideo() {
    if (permissionState === 'denied') {
      setOpen(true)
    } else {
      hmsActions.setLocalVideoEnabled(!videoEnabled).catch(ignoreCantAccessCaptureDeviceError)
    }
  }

  const hotkey = <LayeredHotkeys keys='mod+shift+v' callback={toggleVideo} />
  const button = (
    <Button
      variant={videoEnabled ? 'none' : 'base'}
      className={cn({ 'bg-green-500 text-gray-50 hover:before:opacity-100': videoEnabled })}
      onClick={toggleVideo}
      iconOnly={
        videoEnabled ? <VideoCameraIcon strokeWidth='2' size={24} /> : <VideoCameraOffIcon strokeWidth='2' size={24} />
      }
      tooltip='Toggle video'
      tooltipShortcut='mod+shift+v'
      accessibilityLabel='Toggle video'
      round
      size='large'
    />
  )

  if (permissionState === 'granted') {
    return (
      <div className='flex items-center'>
        {hotkey}
        {button}

        <VideoControlsPicker open={open} setOpen={setOpen} onSelection={() => setOpen(false)}>
          <button>
            <ChevronDownIcon className='text-quaternary hover:text-tertiary' />
          </button>
        </VideoControlsPicker>
      </div>
    )
  }

  return (
    <div className='flex items-center'>
      {hotkey}
      {button}

      <Popover open={open} onOpenChange={setOpen} sheetBreakpoint='sm'>
        <PopoverTrigger>
          <ChevronDownIcon className='text-quaternary hover:text-tertiary' />
        </PopoverTrigger>
        <AnimatePresence>
          <PopoverPortal>
            <PopoverContent
              sideOffset={16}
              className={cn(
                CONTAINER_STYLES.base,
                CONTAINER_STYLES.shadows,
                'bg-elevated dark overflow-hidden rounded-lg sm:w-[300px]'
              )}
            >
              <m.div {...ANIMATION_CONSTANTS}>
                <VideoControlsPermissions />
              </m.div>
            </PopoverContent>
          </PopoverPortal>
        </AnimatePresence>
      </Popover>
    </div>
  )
}

function VideoControlsPicker({
  open,
  setOpen,
  onSelection,
  children
}: {
  open: boolean
  setOpen: (val: boolean) => void
  onSelection: () => void
  children: React.ReactNode
}) {
  const { allDevices, selectedDeviceIDs, updateDevice } = useDevices()
  const { videoInput: devices } = allDevices
  const { videoInput: selectedDeviceID } = selectedDeviceIDs
  const options = devices?.map((device) => ({ label: device.label, value: device.deviceId })) || []

  return (
    <SelectPopover
      open={open}
      setOpen={setOpen}
      onChange={(deviceId) => {
        onSelection()
        updateDevice({ deviceType: DeviceType.videoInput, deviceId })
      }}
      value={selectedDeviceID}
      options={options}
      align='center'
      side='bottom'
      sideOffset={14}
      dark
    >
      {children}
    </SelectPopover>
  )
}

function VideoControlsPermissions() {
  const isDesktop = useIsDesktopApp()

  return (
    <PermissionsPrompt
      title='Enable camera permissions'
      description={
        isDesktop ? (
          <DesktopPermissionsDescription
            action='share your camera'
            name='Camera'
            href={
              isMacOs
                ? 'https://support.apple.com/guide/mac-help/control-access-to-your-camera-mchlf6d108da/mac'
                : isWindows &&
                  'https://support.microsoft.com/en-us/windows/windows-camera-microphone-and-privacy-a83257bc-e990-d54a-d212-b5e41beba857'
            }
          />
        ) : (
          'To share your camera, navigate to your browser settings and enable "Camera" permissions.'
        )
      }
    />
  )
}

function ignoreCantAccessCaptureDeviceError(e: any) {
  // https://www.100ms.live/docs/javascript/v2/how-to-guides/debugging/error-handling#error-codes
  // 3001: User denied permission to access capture device at browser level
  // 3003: Capture device is in use by some other application
  // 3004: Lost access to capture device midway
  // 3005: There is no media to return. Please select either video or audio or both.
  if ('code' in e && (e.code === 3001 || e.code === 3003 || e.code === 3004 || e.code === 3005)) return
  throw e
}
