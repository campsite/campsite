import { useState } from 'react'
import { useRouter } from 'next/router'
import pluralize from 'pluralize'

import { Button, TextField, UIText } from '@campsite/ui'
import { LoadingSpinner } from '@campsite/ui/Spinner'

import { FacePile } from '@/components/FacePile'
import { useGetCallRoom } from '@/hooks/useGetCallRoom'
import { useJoinCallRoom } from '@/hooks/useJoinCallRoom'
import { signinUrl } from '@/utils/queryClient'

export function LoggedOutPrompt() {
  const router = useRouter()
  const callRoomId = router.query.callRoomId as string
  const { joinRoom } = useJoinCallRoom({ callRoomId })
  const { asPath } = useRouter()
  const [isJoining, setIsJoining] = useState(false)
  const { data: callRoom } = useGetCallRoom({ callRoomId })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nameField = e.currentTarget.elements.namedItem('name') as HTMLInputElement

    setIsJoining(true)
    joinRoom({ name: nameField.value })
  }

  if (isJoining) return <LoadingSpinner />

  return (
    <div className='flex flex-1 items-center justify-center'>
      <div className='flex w-[250px] flex-col gap-4 text-center'>
        <div>
          <Button href={signinUrl({ from: asPath })} variant='flat' fullWidth>
            Log in to Campsite
          </Button>
        </div>
        <div className='flex items-center'>
          <div className='flex-grow border-t border-gray-700'></div>
          <UIText className='mx-4'>or</UIText>
          <div className='flex-grow border-t border-gray-700'></div>
        </div>
        <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
          <TextField id='name' required placeholder='Your name' autoComplete='name' />
          <div>
            <Button variant='flat' type='submit' fullWidth>
              Join call
            </Button>
          </div>
        </form>
        {callRoom?.active_peers && callRoom.active_peers.length > 0 && (
          <div className='flex items-center gap-2'>
            <FacePile limit={5} users={callRoom.active_peers.map((peer) => peer.member.user)} size='sm' />
            <UIText quaternary>
              {callRoom.active_peers.length} {pluralize('other', callRoom.active_peers.length)} on this call
            </UIText>
          </div>
        )}
      </div>
    </div>
  )
}
