import { ClipProps } from './utils'

export function AvatarFacepileClip({ size, clipId }: ClipProps) {
  switch (size) {
    case 'xs': {
      return (
        <svg
          className='absolute left-0 top-0'
          width='18'
          height='20'
          viewBox='0 0 18 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M17.7768 3.71292C15.9435 1.44803 13.1409 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C13.1409 20 15.9435 18.552 17.7768 16.2871C16.65 14.4587 16 12.3053 16 10C16 7.69471 16.65 5.54125 17.7768 3.71292Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'sm': {
      return (
        <svg
          className='absolute left-0 top-0'
          width='21'
          height='24'
          viewBox='0 0 21 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M20.6993 3.73429C18.5131 1.43404 15.424 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C15.424 24 18.5131 22.566 20.6993 20.2657C19.0022 17.9493 18 15.0917 18 12C18 8.90832 19.0022 6.05071 20.6993 3.73429Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'base': {
      return (
        <svg
          className='absolute left-0 top-0'
          width='28'
          height='32'
          viewBox='0 0 28 32'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M27.6917 5.07727C24.7716 1.95293 20.6139 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C20.6139 32 24.7716 30.0471 27.6917 26.9227C25.3758 23.8936 24 20.1075 24 16C24 11.8925 25.3758 8.10639 27.6917 5.07727Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'lg': {
      return (
        <svg
          className='absolute left-0 top-0'
          width='33'
          height='40'
          viewBox='0 0 33 40'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M32.5005 4.38699C29.0764 1.64196 24.73 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40C24.73 40 29.0764 38.358 32.5005 35.613C28.4859 31.6274 26 26.104 26 20C26 13.896 28.4859 8.3726 32.5005 4.38699Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'xl': {
      return (
        <svg
          className='absolute left-0 top-0'
          width='55'
          height='64'
          viewBox='0 0 55 64'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M54.2793 9.02974C48.518 3.44068 40.6608 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64C40.6608 64 48.518 60.5593 54.2793 54.9703C49.1085 48.7371 46 40.7316 46 32C46 23.2684 49.1085 15.2629 54.2793 9.02974Z'
            />
          </clipPath>
        </svg>
      )
    }
    case 'xxl': {
      return (
        <svg
          className='absolute left-0 top-0'
          width='99'
          height='112'
          viewBox='0 0 99 112'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <clipPath id={clipId}>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M98.15 19.1291C87.8854 7.40435 72.8074 0 56 0C25.0721 0 0 25.0721 0 56C0 86.9279 25.0721 112 56 112C72.8074 112 87.8854 104.596 98.15 92.8709C90.5152 82.5657 86 69.8101 86 56C86 42.1899 90.5152 29.4343 98.15 19.1291Z'
            />
          </clipPath>
        </svg>
      )
    }
  }
}
