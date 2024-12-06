import { useEffect } from 'react'
import { Portal } from '@radix-ui/react-portal'
import { AnimatePresence, m } from 'framer-motion'
import { useAtom } from 'jotai'
import useSound from 'use-sound'

import { Avatar, Button, CloseIcon, UIText, useBreakpoint, VideoCameraFilledIcon } from '@campsite/ui'

import { CallRoomInvitation, incomingCallRoomInvitationAtom } from '@/atoms/call'
import { MultiUserAvatar } from '@/components/ThreadAvatar'
import { useCurrentUserChannel } from '@/hooks/useCurrentUserChannel'

export function IncomingCallRoomInvitationToast() {
  const [incomingCallRoomInvitation, setIncomingCallRoomInvitation] = useAtom(incomingCallRoomInvitationAtom)
  const lg = useBreakpoint('lg')
  const [playIncomingCallSound] = useSound('/sounds/call-start.mp3', { volume: 0.2 })
  const { channel: currentUserChannel } = useCurrentUserChannel()

  function onDeclineCall() {
    currentUserChannel?.trigger('client-declined-call', { call_room_id: incomingCallRoomInvitation?.call_room_id })
    setIncomingCallRoomInvitation(undefined)
  }

  useEffect(() => {
    if (!incomingCallRoomInvitation) return

    playIncomingCallSound()
    const interval = setInterval(playIncomingCallSound, 5000)

    return () => clearInterval(interval)
  }, [incomingCallRoomInvitation, playIncomingCallSound])

  const initialY = lg ? 0 : 46
  const animateY = lg ? 26 : 56
  const left = lg ? '50%' : 0
  const translateX = lg ? '-50%' : 0

  return (
    <AnimatePresence>
      {incomingCallRoomInvitation && (
        <Portal>
          <m.div
            initial={{ opacity: 0, y: initialY, scale: 0.9, left, translateX }}
            animate={{ opacity: 1, y: animateY, scale: 1, left, translateX }}
            exit={{ opacity: 0, y: initialY, scale: 0.9, left, translateX }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className='bg-primary dark:bg-elevated dark fixed top-0 flex w-full items-center gap-3 p-3 shadow-2xl lg:max-w-[450px] lg:rounded-full dark:shadow-[inset_0px_1px_0px_rgb(255_255_255_/_0.04),_inset_0px_0px_0px_1px_rgb(255_255_255_/_0.02),_0px_1px_2px_rgb(0_0_0_/_0.4),_0px_2px_4px_rgb(0_0_0_/_0.08),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24)]'
          >
            <div className='flex flex-1 select-none items-center gap-3'>
              <AvatarAndTitle incomingCallRoomInvitation={incomingCallRoomInvitation} />
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='destructive'
                iconOnly={<CloseIcon size={24} strokeWidth='2.5' />}
                accessibilityLabel='Decline call'
                onClick={onDeclineCall}
                size='large'
                round
              />
              <Button
                variant='none'
                className='bg-green-500 hover:before:opacity-100'
                iconOnly={<VideoCameraFilledIcon size={24} />}
                accessibilityLabel='Join call'
                href={incomingCallRoomInvitation.call_room_url}
                onClick={() => setIncomingCallRoomInvitation(undefined)}
                size='large'
                round
              />
            </div>
          </m.div>
        </Portal>
      )}
    </AnimatePresence>
  )
}

function AvatarAndTitle({ incomingCallRoomInvitation }: { incomingCallRoomInvitation: CallRoomInvitation }) {
  const { creator_member } = incomingCallRoomInvitation
  const otherMembers = incomingCallRoomInvitation.other_active_peers.map((peer) => peer.member)

  if (otherMembers.length === 0) {
    return (
      <>
        <Avatar urls={creator_member.user.avatar_urls} size='lg' />
        <UIText weight='font-semibold' className='line-clamp-1'>
          {creator_member.user.display_name}
        </UIText>
      </>
    )
  } else if (otherMembers.length === 1) {
    return (
      <>
        <MultiUserAvatar members={[creator_member, ...otherMembers]} size='lg' />
        <div className='flex flex-col'>
          <UIText weight='font-semibold' className='line-clamp-1'>
            {creator_member.user.display_name}
          </UIText>
          <UIText size='text-sm' className='line-clamp-1'>
            and {otherMembers[0].user.display_name}
          </UIText>
        </div>
      </>
    )
  } else {
    return (
      <>
        <MultiUserAvatar members={[creator_member, ...otherMembers]} size='lg' />
        <div className='flex flex-col'>
          <UIText weight='font-semibold' className='line-clamp-1'>
            {creator_member.user.display_name}
          </UIText>
          <UIText size='text-sm' className='line-clamp-1'>
            and {otherMembers.length} others
          </UIText>
        </div>
      </>
    )
  }
}
