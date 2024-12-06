import { selectPeerScreenSharing, useHMSActions, useHMSStore } from '@100mslive/react-sdk'

import { Button } from '@campsite/ui/Button'

export function StopScreensharingButton() {
  const hmsActions = useHMSActions()
  const screenSharingPeer = useHMSStore(selectPeerScreenSharing)

  if (!screenSharingPeer?.isLocal) return null

  return (
    <Button
      size='large'
      className='w-full'
      variant='destructive'
      onClick={() => hmsActions.setScreenShareEnabled(false)}
    >
      Stop screen sharing
    </Button>
  )
}
