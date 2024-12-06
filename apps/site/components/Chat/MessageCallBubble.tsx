import { Button, cn, UIText, VideoCameraFilledIcon } from '@campsite/ui'

import { FacePile, FacepileUser } from '@/components/Facepile'

import { Call, User } from './types'

export function MessageCallBubble({ call, className }: { call: Call; className: string }) {
  return call.active ? (
    <ActiveMessageCall call={call} className={className} />
  ) : (
    <CompletedMessageCall call={call} className={className} />
  )
}

function ActiveMessageCall({ call, className }: { call: Call; className: string }) {
  return (
    <div
      className={cn(
        'bg-primary dark:bg-gray-750 dark relative flex w-full max-w-sm flex-1 items-center p-3 text-left',
        className
      )}
    >
      <div className='rounded-full bg-green-500 p-2'>
        <VideoCameraFilledIcon size={24} />
      </div>

      <UIText weight='font-medium' className='break-anywhere ml-3 line-clamp-1 flex-1'>
        Started a call
      </UIText>

      <div className='hidden sm:contents'>
        <FacePile users={call.peers.map(transformUserToFacepileUser)} size='sm' />
      </div>

      <Button variant='plain' round className='ml-3 bg-green-500 text-white hover:bg-green-400 dark:hover:bg-green-500'>
        Join
      </Button>

      <span className='absolute -right-24 top-6 hidden lg:flex'>
        <svg
          width='49'
          className='text-quaternary opacity-50'
          height='20'
          viewBox='0 0 49 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M39.5295 6.62609C38.5752 6.27976 37.9293 6.74135 37.2276 6.837C36.7479 6.90631 36.2283 6.95551 35.7776 6.84751C34.8117 6.61433 34.5068 5.30921 35.2462 4.68748C35.6228 4.382 36.0669 4.11819 36.5227 3.95237C39.3898 2.91683 42.2708 1.89209 45.1685 0.902622C45.6968 0.715772 46.3042 0.66856 46.8819 0.686984C47.76 0.707034 48.3776 1.59008 48.1622 2.41048C48.102 2.64117 48.0047 2.87624 47.9061 3.09907C46.912 5.26616 45.9441 7.44257 44.9102 9.58956C44.6693 10.0901 44.3145 10.5792 43.8972 10.9641C43.0968 11.7048 42.1468 11.3952 41.8325 10.3272C41.7469 10.0268 41.7447 9.69177 41.6822 9.16514C41.2105 9.40737 40.8767 9.54631 40.5639 9.75728C38.5698 11.0867 36.588 12.4146 34.6077 13.7548C30.1934 16.725 25.2079 18.1484 20.0054 18.902C18.3813 19.1319 16.6817 19.1472 15.0655 18.9166C12.5334 18.5586 10.0275 17.9989 7.56222 17.3598C4.78632 16.6334 2.79481 14.8204 1.36712 12.3817C1.13123 11.975 0.945404 11.463 0.953346 11.0025C0.963476 10.666 1.24428 10.1856 1.53963 10.0388C1.83498 9.89198 2.39524 9.97457 2.65869 10.1917C3.0985 10.5246 3.43382 11.0312 3.77567 11.4875C5.18299 13.3325 6.99882 14.5081 9.28194 14.9825C11.6282 15.4618 13.936 16.1444 16.3534 16.1682C21.6873 16.2062 26.6649 14.8211 31.2751 12.2375C33.7859 10.8344 36.1203 9.10445 38.5339 7.51416C38.8699 7.28802 39.134 6.98348 39.5295 6.62609Z'
            fill='currentColor'
          />
        </svg>
      </span>
    </div>
  )
}

function CompletedMessageCall({ call, className }: { call: Call; className: string }) {
  return (
    <div className={cn('bg-primary dark:bg-gray-750 dark relative flex w-full max-w-sm flex-col p-3', className)}>
      <div className='grid grid-cols-[40px,1fr] items-center gap-3'>
        <div className='bg-quaternary rounded-full p-2'>
          <VideoCameraFilledIcon size={24} />
        </div>

        <div className='flex w-full flex-col items-start gap-2'>
          <div className='flex w-full flex-1 items-center gap-3'>
            <UIText weight='font-semibold' className='line-clamp-1 break-all'>
              Call ended
            </UIText>
            <UIText tertiary>{call.duration}</UIText>

            <div className='flex flex-1 justify-end'>
              <FacePile size='sm' limit={2} users={call.peers.map(transformUserToFacepileUser)} />
            </div>
          </div>
        </div>
      </div>

      <div className='mt-1 grid grid-cols-[40px,1fr] gap-3'>
        <div className='col-start-2 flex items-center gap-2'>
          <Button fullWidth variant='flat' round className='dark:hover:bg-quaternary'>
            Watch recording
          </Button>
        </div>
      </div>
    </div>
  )
}

function transformUserToFacepileUser(user: User): FacepileUser {
  return {
    name: user.display_name,
    src: user.avatar_url,
    url: undefined
  }
}
