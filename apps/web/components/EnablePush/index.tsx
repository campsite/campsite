import Image from 'next/image'

import { Button, UIText } from '@campsite/ui'

import { useWebPush } from '@/contexts/WebPush'
import { useIsPWA } from '@/hooks/useIsPWA'
import { useStoredState } from '@/hooks/useStoredState'

export function EnablePush({
  hideAfterPrompt = true,
  containerClassName = ''
}: {
  hideAfterPrompt?: boolean
  containerClassName?: string
}) {
  const [hasPrompted, setHasPrompted] = useStoredState('webpush.has-prompted', false)
  const isPWA = useIsPWA()
  const { permission, subscribe } = useWebPush()

  if (!isPWA) {
    return null
  }

  if (hasPrompted && hideAfterPrompt) {
    return null
  }

  if (permission !== 'default') {
    return null
  }

  return (
    <div className={containerClassName}>
      <div className='dark:bg-gray-850 -mt-px flex flex-col gap-3 rounded-2xl bg-gray-100 px-4 pb-4 pt-6'>
        <div className='flex items-center justify-center'>
          <div className='relative'>
            <Image width={64} height={64} src='/img/desktop-app-icon.png' alt='' className='h-16 w-16 rounded-lg' />
            <div className='h-4.5 w-4.5 bg-brand-secondary dark:ring-gray-850 absolute right-0 top-0 rounded-full ring-[3px] ring-gray-100' />
          </div>
        </div>
        <div className='mb-3 flex flex-col items-center justify-center text-center'>
          <UIText size='text-base' weight='font-semibold'>
            Stay in the loop
          </UIText>
          <UIText size='text-base' secondary className='px-4'>
            Enable push notifications for new messages and activity on your posts.
          </UIText>
        </div>
        <div className='flex flex-col gap-3'>
          <Button
            size='large'
            variant='primary'
            onClick={async () => {
              await subscribe()
              setHasPrompted(true)
            }}
          >
            Enable push notifications
          </Button>
          <Button
            size='large'
            variant='base'
            onClick={async () => {
              setHasPrompted(true)
            }}
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  )
}
