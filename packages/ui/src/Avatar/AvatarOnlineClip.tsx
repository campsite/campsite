import { ClipProps } from './utils'

export function AvatarOnlineClip({ size, clipId }: ClipProps) {
  switch (size) {
    case 'xs': {
      return (
        <svg
          className='absolute bottom-0 right-0'
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M18.211 12.3367C18.8768 12.6106 19.7432 12.3744 19.8621 11.6644C19.9528 11.1231 20 10.5671 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C10.5671 20 11.1231 19.9528 11.6644 19.8621C12.3744 19.7432 12.6106 18.8768 12.3367 18.211C12.1197 17.6835 12 17.1057 12 16.5C12 14.0147 14.0147 12 16.5 12C17.1057 12 17.6835 12.1197 18.211 12.3367Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'sm': {
      return (
        <svg
          className='absolute bottom-0 right-0'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M21.7386 14.4747C22.5991 14.8586 23.7631 14.5652 23.89 13.6314C23.9625 13.098 24 12.5534 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C12.5534 24 13.098 23.9625 13.6314 23.89C14.5652 23.7631 14.8586 22.5991 14.4747 21.7386C14.1696 21.0548 14 20.2972 14 19.5C14 16.4624 16.4624 14 19.5 14C20.2972 14 21.0548 14.1696 21.7386 14.4747Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'base': {
      return (
        <svg
          className='absolute bottom-0 right-0'
          width='32'
          height='32'
          viewBox='0 0 32 32'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M29.3228 20.3946C30.2678 20.7269 31.4282 20.3718 31.6396 19.3927C31.8757 18.2992 32 17.1641 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C17.1641 32 18.2992 31.8757 19.3927 31.6396C20.3718 31.4282 20.7269 30.2678 20.3946 29.3228C20.139 28.596 20 27.8142 20 27C20 23.134 23.134 20 27 20C27.8142 20 28.596 20.139 29.3228 20.3946Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'lg': {
      return (
        <svg
          className='absolute bottom-0 right-0'
          width='40'
          height='40'
          viewBox='0 0 40 40'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M36.422 24.6734C37.7535 25.2212 39.4863 24.7488 39.7242 23.3288C39.9056 22.2462 40 21.1341 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40C21.1341 40 22.2462 39.9056 23.3288 39.7242C24.7488 39.4863 25.2212 37.7535 24.6734 36.422C24.2394 35.3671 24 34.2115 24 33C24 28.0294 28.0294 24 33 24C34.2115 24 35.3671 24.2394 36.422 24.6734Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'xl': {
      return (
        <svg
          className='absolute bottom-0 right-0'
          width='64'
          height='64'
          viewBox='0 0 64 64'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M58.2545 43.853C59.7634 44.4864 61.6895 44.0736 62.2277 42.5282C63.376 39.2311 64 35.6884 64 32C64 14.3269 49.6731 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64C35.6884 64 39.2311 63.376 42.5282 62.2277C44.0736 61.6895 44.4864 59.7634 43.853 58.2545C43.3036 56.9457 43 55.5083 43 54C43 47.9249 47.9249 43 54 43C55.5083 43 56.9457 43.3036 58.2545 43.853Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'xxl': {
      return (
        <svg
          className='absolute bottom-0 right-0'
          width='112'
          height='112'
          viewBox='0 0 112 112'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M100.734 83.3298C102.415 84.1574 104.616 83.8757 105.495 82.2207C109.647 74.3981 112 65.4738 112 56C112 25.0721 86.9279 0 56 0C25.0721 0 0 25.0721 0 56C0 86.9279 25.0721 112 56 112C65.4738 112 74.3981 109.647 82.2207 105.495C83.8757 104.616 84.1574 102.415 83.3298 100.734C82.4783 99.0047 82 97.0582 82 95C82 87.8203 87.8203 82 95 82C97.0582 82 99.0047 82.4783 100.734 83.3298Z'
            />
          </clipPath>
        </svg>
      )
    }
  }
}
