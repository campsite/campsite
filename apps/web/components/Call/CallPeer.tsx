import { useEffect } from 'react'
import {
  HMSPeer,
  selectConnectionQualityByPeerID,
  selectIsPeerAudioEnabled,
  selectIsPeerVideoEnabled,
  selectPeerAudioByID,
  useHMSStore,
  useVideo
} from '@100mslive/react-sdk'
import { animate, m, useMotionValue, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { Avatar, ExpandIcon, MicrophoneMuteIcon, MinimizeIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { ConnectionIndicator } from '@/components/Call/ConnectionIndicator'
import { useGetCallRoom } from '@/hooks/useGetCallRoom'

interface CallPeerProps {
  peer: HMSPeer
  width?: string
  height?: string
  disableMinimize?: boolean
  onMinimize?: () => void
  minimized?: boolean
  className?: string
}

export function CallPeer({
  peer,
  width,
  height,
  disableMinimize = false,
  onMinimize,
  minimized,
  className
}: CallPeerProps) {
  const audioEnabled = useHMSStore(selectIsPeerAudioEnabled(peer.id))
  const videoEnabled = useHMSStore(selectIsPeerVideoEnabled(peer.id))
  const downlinkQuality = useHMSStore(selectConnectionQualityByPeerID(peer.id))?.downlinkQuality
  const hasPoorConnection = downlinkQuality !== undefined && downlinkQuality >= 0 && downlinkQuality <= 2

  const { videoRef } = useVideo({
    trackId: peer.videoTrack
  })

  const audioLevel = useHMSStore(selectPeerAudioByID(peer.id))
  const audioMotionLevel = useMotionValue(audioLevel)

  useEffect(() => {
    animate(audioMotionLevel, audioLevel, { duration: 0.2, ease: [0.16, 1, 0.3, 1] })
  }, [audioLevel, audioMotionLevel])

  const opacity = useTransform(audioMotionLevel, [0, 10], [0, 1])
  const boxShadow = useTransform(audioMotionLevel, [0, 10], ['inset 0 0 0 0px #5EC269', 'inset 0 0 0 2px #5EC269'])

  const router = useRouter()
  const { data: callRoom } = useGetCallRoom({ callRoomId: router.query.callRoomId as string })
  const user = callRoom?.active_peers?.find((dbPeer) => dbPeer.remote_peer_id === peer.id)?.member?.user

  return (
    <div
      className={cn(
        'group/peer bg-secondary relative isolate flex items-center justify-center overflow-hidden rounded-lg',
        {
          'absolute bottom-2 left-2 z-10 aspect-[4/3] bg-black/70 shadow-[inset_0px_1px_0px_rgb(255_255_255_/_0.04),_inset_0px_0px_0px_1px_rgb(255_255_255_/_0.1),_0px_1px_2px_rgb(0_0_0_/_0.12),_0px_2px_4px_rgb(0_0_0_/_0.08),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24)] backdrop-blur-md':
            minimized && peer.isLocal,
          'z-0': !minimized || !peer.isLocal
        },
        className
      )}
      style={{ width, height }}
    >
      <m.div
        className={cn(
          'pointer-events-none absolute inset-0 z-10 rounded-lg border-green-500 transition',
          !audioEnabled && '!opacity-0'
        )}
        style={{
          boxShadow,
          opacity
        }}
      />
      {videoEnabled ? (
        <>
          <div className='absolute inset-0 z-0 flex h-full w-full items-center justify-center'>
            <video
              className={cn('h-full w-full object-cover', {
                '-scale-x-100': peer.isLocal
              })}
              ref={videoRef}
              autoPlay
              muted
              playsInline
            />
          </div>
        </>
      ) : (
        <div className='relative flex h-full w-full items-center justify-center'>
          {minimized && peer.isLocal ? (
            <>
              {user && (
                <Image
                  src={user.avatar_urls.xxl}
                  alt=''
                  width={256}
                  height={256}
                  className='aspect-square h-auto max-h-[50%] min-h-[32px] w-auto min-w-[32px] max-w-[50%] flex-none select-none rounded-full'
                />
              )}
            </>
          ) : (
            <Avatar urls={user?.avatar_urls} size='xl' />
          )}
        </div>
      )}

      {((peer.isLocal && !minimized) || !peer.isLocal) && (
        <div className='absolute bottom-2.5 right-2.5 text-sm font-medium text-white opacity-80 transition-opacity [text-shadow:_0_1px_1px_rgba(0,0,0,0.24)] group-hover/peer:opacity-100'>
          {peer.name}
        </div>
      )}

      <div className='absolute right-1.5 top-1.5 flex items-center gap-1'>
        {peer.isLocal && !disableMinimize && (
          <button
            onClick={onMinimize}
            className={cn('rounded-md p-1 opacity-0 backdrop-blur-lg hover:bg-black group-hover/peer:opacity-100', {
              'bg-black/50 hover:bg-black/90': videoEnabled,
              'bg-white/10 hover:bg-white/20': !videoEnabled
            })}
          >
            {minimized ? <ExpandIcon /> : <MinimizeIcon />}
          </button>
        )}
        {videoEnabled && (
          <div
            className={cn('rounded-md bg-black/50 p-1 backdrop-blur-lg', {
              'opacity-0 group-hover/peer:opacity-100': !hasPoorConnection
            })}
          >
            <ConnectionIndicator peerId={peer.id} />
          </div>
        )}
        {!audioEnabled && (
          <div
            className={cn('rounded-md p-1 backdrop-blur-lg', {
              'bg-black/50': videoEnabled,
              'bg-white/10': !videoEnabled
            })}
          >
            <MicrophoneMuteIcon strokeWidth='2' />
          </div>
        )}
      </div>
    </div>
  )
}
