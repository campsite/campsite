import { ClipProps } from './utils'

export function AvatarNotificationReasonSquareClip({ size, clipId }: ClipProps) {
  switch (size) {
    case 'sm': {
      return (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M4 0C1.79086 0 0 1.79086 0 4V20C0 22.2091 1.79086 24 4 24H10.0956C10.7708 24 11.2523 23.3423 11.1399 22.6765C11.0479 22.1314 11 21.5713 11 21C11 15.4772 15.4772 11 21 11C21.5713 11 22.1314 11.0479 22.6765 11.1399C23.3423 11.2523 24 10.7708 24 10.0956V4C24 1.79086 22.2091 0 20 0H4Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'base': {
      return (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M6 0C2.68629 0 0 2.68629 0 6V26C0 29.3137 2.68629 32 6 32H12.4866C13.5753 32 14.3115 30.8666 14.0491 29.81C13.7992 28.8035 13.6666 27.7507 13.6666 26.667C13.6666 19.4873 19.4869 13.667 26.6666 13.667C27.7505 13.667 28.8034 13.7996 29.8099 14.0496C30.8666 14.3119 32 13.5758 32 12.4871V6C32 2.68629 29.3137 0 26 0H6Z'
            />
          </clipPath>
        </svg>
      )
    }
  }

  return null
}
