import { useCallback, useEffect, useState } from 'react'
import { HMSKrispPlugin } from '@100mslive/hms-noise-cancellation'
import { selectLocalAudioTrackID, selectRoom, useHMSActions, useHMSStore } from '@100mslive/react-sdk'

const plugin = new HMSKrispPlugin()

const useNoiseCancellationWithPlugin = () => {
  const actions = useHMSActions()
  const [isNoiseCancellationEnabled, setNoiseCancellationEnabled] = useState(false)
  const enableNoiseCancellationWithPlugin = useCallback(async () => {
    if (!plugin.checkSupport().isSupported) {
      throw Error('Krisp plugin is not supported')
    }
    await actions.addPluginToAudioTrack(plugin).catch((e) => {
      if (e.name === 'AddAlreadyInProgress') return
      throw e
    })
    setNoiseCancellationEnabled(true)
  }, [actions])

  return { enableNoiseCancellationWithPlugin, isNoiseCancellationEnabled }
}

export const NoiseCancellation = () => {
  const localPeerAudioTrackID = useHMSStore(selectLocalAudioTrackID)
  const { isNoiseCancellationEnabled, enableNoiseCancellationWithPlugin } = useNoiseCancellationWithPlugin()
  const room = useHMSStore(selectRoom)

  const isNoiseCancellationSupported =
    plugin.checkSupport().isSupported && room.isNoiseCancellationEnabled && localPeerAudioTrackID

  useEffect(() => {
    if (!isNoiseCancellationSupported || isNoiseCancellationEnabled) return

    enableNoiseCancellationWithPlugin()
  }, [enableNoiseCancellationWithPlugin, isNoiseCancellationEnabled, isNoiseCancellationSupported])

  return null
}
