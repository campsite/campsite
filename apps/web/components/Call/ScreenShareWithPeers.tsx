import {
  selectPeers,
  selectPeerScreenSharing,
  selectScreenShareByPeerID,
  useHMSStore,
  useVideo
} from '@100mslive/react-sdk'
import * as R from 'remeda'

import { CallPeer } from '@/components/Call/CallPeer'

export function ScreenShareWithPeers() {
  return (
    <div className='flex h-full w-full flex-1 items-center gap-2'>
      <div className='h-full w-full flex-1'>
        <ScreenShare />
      </div>

      <div className='hidden h-full min-w-[200px] max-w-[300px] flex-shrink-0 basis-[30%] sm:block'>
        <Peers />
      </div>
    </div>
  )
}

function ScreenShare() {
  const screenSharingPeer = useHMSStore(selectPeerScreenSharing)
  const screenshareVideoTrack = useHMSStore(selectScreenShareByPeerID(screenSharingPeer?.id))

  const { videoRef: streamVideoRef } = useVideo({
    trackId: screenshareVideoTrack?.id
  })

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <video className='max-h-full max-w-full' ref={streamVideoRef} autoPlay muted playsInline />
    </div>
  )
}

function Peers() {
  const screenSharingPeer = useHMSStore(selectPeerScreenSharing)
  const otherPeers = useHMSStore(selectPeers).filter((peer) => peer.id !== screenSharingPeer?.id)
  const peers = R.filter([screenSharingPeer, ...otherPeers], R.isTruthy)

  return (
    <div className='h-full overflow-y-scroll'>
      <div className='flex flex-col gap-2'>
        {peers.map((peer, i) => (
          <CallPeer key={peer.id + `${i}`} peer={peer} disableMinimize={true} className='aspect-video' />
        ))}
      </div>
    </div>
  )
}
