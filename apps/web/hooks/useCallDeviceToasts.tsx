import { useEffect, useRef } from 'react'
import { useDevices } from '@100mslive/react-sdk'
import { useSetAtom } from 'jotai'

import { addCallToastAtom } from '@/atoms/callToasts'

export function useCallDeviceToasts() {
  const { allDevices, selectedDeviceIDs } = useDevices()
  const { audioInput: audioInDevices, audioOutput: audioOutDevices, videoInput: videoInDevices } = allDevices
  const {
    audioInput: selectedAudioInDeviceID,
    audioOutput: selectedAudioOutDeviceID,
    videoInput: selectedVideoInDeviceID
  } = selectedDeviceIDs
  const selectedAudioInDevice = audioInDevices?.find((device) => device.deviceId === selectedAudioInDeviceID)
  const selectedAudioOutDevice = audioOutDevices?.find((device) => device.deviceId === selectedAudioOutDeviceID)
  const selectedVideoInDevice = videoInDevices?.find((device) => device.deviceId === selectedVideoInDeviceID)
  const prevSelectedAudioInDeviceRef = useRef<MediaDeviceInfo | undefined>(selectedAudioInDevice)
  const prevSelectedAudioOutDeviceRef = useRef<MediaDeviceInfo | undefined>(selectedAudioOutDevice)
  const prevSelectedVideoInDeviceRef = useRef<MediaDeviceInfo | undefined>(selectedVideoInDevice)

  const addCallToast = useSetAtom(addCallToastAtom)

  useEffect(() => {
    if (!selectedAudioInDevice || !prevSelectedAudioInDeviceRef.current) {
      prevSelectedAudioInDeviceRef.current = selectedAudioInDevice
      return
    }

    prevSelectedAudioInDeviceRef.current = selectedAudioInDevice
    addCallToast(`Your audio input is ${selectedAudioInDevice.label}`)
  }, [addCallToast, selectedAudioInDevice])

  useEffect(() => {
    if (!selectedAudioOutDevice || !prevSelectedAudioOutDeviceRef.current) {
      prevSelectedAudioOutDeviceRef.current = selectedAudioOutDevice
      return
    }

    prevSelectedAudioOutDeviceRef.current = selectedAudioOutDevice
    addCallToast(`Your audio output is ${selectedAudioOutDevice.label}`)
  }, [addCallToast, selectedAudioOutDevice])

  useEffect(() => {
    if (!selectedVideoInDevice || !prevSelectedVideoInDeviceRef.current) {
      prevSelectedVideoInDeviceRef.current = selectedVideoInDevice
      return
    }

    prevSelectedVideoInDeviceRef.current = selectedVideoInDevice
    addCallToast(`Your video input is ${selectedVideoInDevice.label}`)
  }, [addCallToast, selectedVideoInDevice])
}
