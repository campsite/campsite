import { ClipProps } from './utils'

export function AvatarNotificationReasonClip({ size, clipId }: ClipProps) {
  switch (size) {
    case 'sm': {
      return (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M23.7769 9.68515C23.9432 10.536 23.1081 11.1842 22.2478 11.0771C21.839 11.0262 21.4226 11 21 11C15.4772 11 11 15.4772 11 21C11 21.4226 11.0262 21.839 11.0771 22.2478C11.1842 23.1081 10.536 23.9432 9.68515 23.7769C4.16541 22.6982 0 17.8355 0 12C0 5.37258 5.37258 0 12 0C17.8355 0 22.6982 4.16541 23.7769 9.68515Z'
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
              d='M31.6498 12.6551C31.9206 13.928 30.5178 14.803 29.2653 14.4496C28.2271 14.1567 27.1319 14 26 14C19.3726 14 14 19.3726 14 26C14 27.1319 14.1567 28.2271 14.4496 29.2653C14.803 30.5178 13.928 31.9206 12.6551 31.6498C5.42424 30.1119 0 23.6894 0 16C0 7.16344 7.16344 0 16 0C23.6894 0 30.1119 5.42424 31.6498 12.6551Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'lg': {
      return (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M39.5623 15.8188C39.9007 17.41 38.1473 18.5037 36.5816 18.062C35.2839 17.6959 33.9148 17.5 32.5 17.5C24.2157 17.5 17.5 24.2157 17.5 32.5C17.5 33.9148 17.6959 35.2839 18.062 36.5816C18.5037 38.1473 17.41 39.9007 15.8189 39.5623C6.78029 37.6398 0 29.6117 0 20C0 8.9543 8.9543 0 20 0C29.6117 0 37.6398 6.78029 39.5623 15.8188Z'
            />
          </clipPath>
        </svg>
      )
    }
  }

  return null
}
