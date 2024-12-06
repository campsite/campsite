/* eslint-disable max-lines */
interface IconProps {
  size?: number
  strokeWidth?: string
  [key: string]: any
}

interface AnimatedIconProps extends IconProps {
  isAnimated?: boolean
}

export function FaceSmileIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M9.75 13.75C9.75 13.75 10 15.25 12 15.25C14 15.25 14.25 13.75 14.25 13.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M10.5 10C10.5 10.2761 10.2761 10.5 10 10.5C9.72386 10.5 9.5 10.2761 9.5 10C9.5 9.72386 9.72386 9.5 10 9.5C10.2761 9.5 10.5 9.72386 10.5 10Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M14.5 10C14.5 10.2761 14.2761 10.5 14 10.5C13.7239 10.5 13.5 10.2761 13.5 10C13.5 9.72386 13.7239 9.5 14 9.5C14.2761 9.5 14.5 9.72386 14.5 10Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function CanvasCommentIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 19.25H5.77778C5.21015 19.25 4.75 18.7898 4.75 18.2222V12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

export function FaceSmilePlusIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M9.75 14.75s.75 1 2.25 1 2.25-1 2.25-1m5-3V12A7.25 7.25 0 1 1 12 4.75h.25m7 2.25h-4.5M17 9.25v-4.5M10 11v.01m4-.01v.01'
      ></path>
    </svg>
  )
}

export function BoltIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M10.75 13.25H6.75L13.25 4.75V10.75H17.25L10.75 19.25V13.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function BoltFilledIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M10.75 13.25H6.75L13.25 4.75V10.75H17.25L10.75 19.25V13.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        fill='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function EyeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M19.25 12C19.25 13 17.5 18.25 12 18.25C6.5 18.25 4.75 13 4.75 12C4.75 11 6.5 5.75 12 5.75C17.5 5.75 19.25 11 19.25 12Z'
      ></path>
      <circle
        cx='12'
        cy='12'
        r='2.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
    </svg>
  )
}

export function EyeHideIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M18.6247 10C19.0646 10.8986 19.25 11.6745 19.25 12C19.25 13 17.5 18.25 12 18.25C11.2686 18.25 10.6035 18.1572 10 17.9938M7 16.2686C5.36209 14.6693 4.75 12.5914 4.75 12C4.75 11 6.5 5.75 12 5.75C13.7947 5.75 15.1901 6.30902 16.2558 7.09698'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M19.25 4.75L4.75 19.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M10.409 13.591C9.53033 12.7123 9.53033 11.2877 10.409 10.409C11.2877 9.5303 12.7123 9.5303 13.591 10.409'
      ></path>
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='12' cy='12' r='7.25' stroke='currentColor' strokeWidth={strokeWidth}></circle>
      <path stroke='currentColor' strokeWidth={strokeWidth} d='M12 8V12L14 14'></path>
    </svg>
  )
}

export function AlarmIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M7 18L5.75 19.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M17 18L18.25 19.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12 8.75V12L14.25 14.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M18.75 4.75L19.25 5.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M5.25 4.75L4.75 5.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function AlarmCheckIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M5.25 4.75L4.75 5.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 8.75V12L14.25 14.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19.1297 13.3166C18.4026 17.2541 14.6212 19.8566 10.6837 19.1295C6.74625 18.4024 4.14373 14.621 4.87085 10.6835C5.59797 6.746 9.37939 4.14348 13.3168 4.8706'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M7 18L5.75 19.25' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M17 18L18.25 19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M16.5 7.14706L17.9457 9.07471C18.0845 9.25968 18.374 9.22111 18.4648 9.00848C19.0609 7.61272 20.2497 5.33354 21.5 4.5'
        stroke='#16A34A'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  )
}

export function SunIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle
        cx='12'
        cy='12'
        r='3.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M12 2.75V4.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M17.25 6.75L16.0659 7.93416'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M21.25 12.0001L19.75 12.0001'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M17.25 17.2501L16.0659 16.066'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M12 19.75V21.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M7.9341 16.0659L6.74996 17.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.25 12.0001L2.75 12.0001'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M7.93405 7.93423L6.74991 6.75003'
      ></path>
    </svg>
  )
}

export function MoonIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M18.25 15.0314C17.7575 15.1436 17.2459 15.2027 16.7209 15.2027C12.8082 15.2027 9.63607 11.9185 9.63607 7.86709C9.63607 6.75253 9.87614 5.69603 10.3057 4.75C7.12795 5.47387 4.75 8.40659 4.75 11.9143C4.75 15.9657 7.9221 19.25 11.8348 19.25C14.6711 19.25 17.1182 17.5242 18.25 15.0314Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function MoonFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M17.4714 16.3591C17.8464 15.85 17.3532 15.2027 16.7209 15.2027V15.2027C12.8082 15.2027 9.63607 11.9185 9.63607 7.86709C9.63607 7.46162 9.66784 7.06383 9.72895 6.67624C9.85778 5.8592 9.15169 5.06991 8.43247 5.4784C6.23784 6.72486 4.75 9.1397 4.75 11.9143C4.75 15.9657 7.9221 19.25 11.8348 19.25C14.1337 19.25 16.177 18.1162 17.4714 16.3591Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function InboxIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M19.25 11.75L17.6644 6.20056C17.4191 5.34195 16.6344 4.75 15.7414 4.75H8.2586C7.36564 4.75 6.58087 5.34196 6.33555 6.20056L4.75 11.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M10.2142 12.3689C9.95611 12.0327 9.59467 11.75 9.17085 11.75H4.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V11.75H14.8291C14.4053 11.75 14.0439 12.0327 13.7858 12.3689C13.3745 12.9046 12.7276 13.25 12 13.25C11.2724 13.25 10.6255 12.9046 10.2142 12.3689Z'
      ></path>
    </svg>
  )
}

export function OpenPaneIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M14.25 4.75v14.5m-3-8.5L9.75 12l1.5 1.25m-4.5 6h10.5a2 2 0 0 0 2-2V6.75a2 2 0 0 0-2-2H6.75a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2Z'
      ></path>
    </svg>
  )
}

export function NoteIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12.75 4.75H7.75C6.64543 4.75 5.75 5.64543 5.75 6.75V17.25C5.75 18.3546 6.64543 19.25 7.75 19.25H16.25C17.3546 19.25 18.25 18.3546 18.25 17.25V10.25M12.75 4.75L18.25 10.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 16H15M9 13H11.3077'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function PrivateNoteIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M18.25 10.25L12.75 4.75H7.75C6.64543 4.75 5.75 5.64543 5.75 6.75V17.25C5.75 18.3546 6.64543 19.25 7.75 19.25H10.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 16H11.5M9 13H11.3077'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.1562 16.4062C14.1562 16.1991 14.3241 16.0312 14.5312 16.0312H18.4688C18.6759 16.0312 18.8438 16.1991 18.8438 16.4062V18.4688C18.8438 18.883 18.508 19.2188 18.0938 19.2188H14.9062C14.492 19.2188 14.1562 18.883 14.1562 18.4688V16.4062Z'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.906 15.9375V15.8785C14.906 15.2931 14.8708 14.6405 15.2797 14.2215C15.5129 13.9825 15.8902 13.7812 16.4998 13.7812C17.1093 13.7812 17.4867 13.9825 17.7198 14.2215C18.1287 14.6405 18.0935 15.2931 18.0935 15.8785V15.9375'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function NoteFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M16.5 20H7.5C6.11929 20 5 18.8807 5 17.5V6.5C5 5.11929 6.11929 4 7.5 4H12.4645C13.1275 4 13.7634 4.26339 14.2322 4.73223L18.2678 8.76777C18.7366 9.23661 19 9.87249 19 10.5355V17.5C19 18.8807 17.8807 20 16.5 20ZM8 12.25C7.58579 12.25 7.25 12.5858 7.25 13C7.25 13.4142 7.58579 13.75 8 13.75H11.0769C11.4911 13.75 11.8269 13.4142 11.8269 13C11.8269 12.5858 11.4911 12.25 11.0769 12.25H8ZM8 15.25C7.58579 15.25 7.25 15.5858 7.25 16C7.25 16.4142 7.58579 16.75 8 16.75H16C16.4142 16.75 16.75 16.4142 16.75 16C16.75 15.5858 16.4142 15.25 16 15.25H8Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function NotePlusIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12.75 19.25H7.75C6.64543 19.25 5.75 18.3546 5.75 17.25V6.75C5.75 5.64543 6.64543 4.75 7.75 4.75H12.75L18.25 10.25V14'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 16H15M9 13H11.3077'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M18.125 17.25V19.25M18.125 19.25V21.25M18.125 19.25H16M18.125 19.25H20.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ComponentIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M9.75 7L12 4.75L14.25 7L12 9.25L9.75 7Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M14.75 12L17 9.75L19.25 12L17 14.25L14.75 12Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M9.75 17L12 14.75L14.25 17L12 19.25L9.75 17Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 12L7 9.75L9.25 12L7 14.25L4.75 12Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ChatBubbleIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12 18.25C15.866 18.25 19.25 16.1552 19.25 11.5C19.25 6.84483 15.866 4.75 12 4.75C8.13401 4.75 4.75 6.84483 4.75 11.5C4.75 13.2675 5.23783 14.6659 6.05464 15.7206C6.29358 16.0292 6.38851 16.4392 6.2231 16.7926C6.12235 17.0079 6.01633 17.2134 5.90792 17.4082C5.45369 18.2242 6.07951 19.4131 6.99526 19.2297C8.0113 19.0263 9.14752 18.722 10.0954 18.2738C10.2933 18.1803 10.5134 18.1439 10.7305 18.1714C11.145 18.224 11.5695 18.25 12 18.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ChatBubbleUnreadIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M19.25 11.5C19.25 16.1552 15.866 18.25 12 18.25C11.5695 18.25 11.145 18.224 10.7305 18.1714C10.5134 18.1439 10.2933 18.1803 10.0954 18.2738C9.14752 18.722 8.0113 19.0263 6.99526 19.2297C6.07951 19.4131 5.45369 18.2242 5.90792 17.4082C6.01633 17.2134 6.12235 17.0079 6.2231 16.7926C6.38851 16.4392 6.29358 16.0292 6.05464 15.7206C5.23783 14.6659 4.75 13.2675 4.75 11.5C4.75 6.84483 8.13401 4.75 12 4.75'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M21 6C21 7.65684 19.6568 9 18 9C16.3432 9 15 7.65684 15 6C15 4.34316 16.3432 3 18 3C19.6568 3 21 4.34316 21 6Z'
        fill='#3B82F6'
      />
    </svg>
  )
}

export function ChatBubblePlusIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10.0954 4.93176C7.08694 5.53116 4.75 7.63154 4.75 11.5001C4.75 13.2676 5.23783 14.666 6.05464 15.7207C6.29358 16.0293 6.38851 16.4393 6.2231 16.7927C6.12235 17.008 6.01633 17.2135 5.90792 17.4083C5.45369 18.2243 6.07951 19.4132 6.99526 19.2298C8.0113 19.0264 9.14752 18.7221 10.0954 18.2739C10.2933 18.1804 10.5134 18.144 10.7305 18.1715C11.145 18.2241 11.5695 18.2501 12 18.2501C15.3056 18.2501 18.2588 16.7186 19.0455 13.3645'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M18 3V6M18 6V9M18 6H15M18 6H21'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ChatBubbleFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12 18.25C15.866 18.25 19.25 16.1552 19.25 11.5C19.25 6.84483 15.866 4.75 12 4.75C8.13401 4.75 4.75 6.84483 4.75 11.5C4.75 13.2675 5.23783 14.6659 6.05464 15.7206C6.29358 16.0292 6.38851 16.4392 6.2231 16.7926C6.12235 17.0079 6.01633 17.2134 5.90792 17.4082C5.45369 18.2242 6.07951 19.4131 6.99526 19.2297C8.0113 19.0263 9.14752 18.722 10.0954 18.2738C10.2933 18.1803 10.5134 18.1439 10.7305 18.1714C11.145 18.224 11.5695 18.25 12 18.25Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function CompassIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M10.409 10.409L15.2499 8.74997L13.591 13.591L8.75012 15.25L10.409 10.409Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function FeedbackRequestIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12 18.25C15.866 18.25 19.25 16.1552 19.25 11.5C19.25 6.84483 15.866 4.75 12 4.75C8.13401 4.75 4.75 6.84483 4.75 11.5C4.75 13.2675 5.23783 14.6659 6.05464 15.7206C6.29358 16.0292 6.38851 16.4392 6.2231 16.7926C6.12235 17.0079 6.01633 17.2134 5.90792 17.4082C5.45369 18.2242 6.07951 19.4131 6.99526 19.2297C8.0113 19.0263 9.14752 18.722 10.0954 18.2738C10.2933 18.1803 10.5134 18.1439 10.7305 18.1714C11.145 18.224 11.5695 18.25 12 18.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10.5 9.20623C10.6424 8.91891 10.8622 8.67712 11.1347 8.50815C11.4072 8.33918 11.7216 8.24976 12.0422 8.25C12.3837 8.24998 12.7176 8.35158 13.0012 8.54186C13.2848 8.73213 13.5054 9.00249 13.6349 9.31852C13.7645 9.63455 13.797 9.98197 13.7285 10.3166C13.66 10.6512 13.4934 10.9578 13.2501 11.1975C12.8676 11.5746 12.4025 11.9816 12.1776 12.4597M12.0422 14.7524V14.76'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function FeedbackRequestAltIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10.0954 4.93176C7.08694 5.53116 4.75 7.63154 4.75 11.5001C4.75 13.2676 5.23783 14.666 6.05464 15.7207C6.29358 16.0293 6.38851 16.4393 6.2231 16.7927C6.12235 17.008 6.01633 17.2135 5.90792 17.4083C5.45369 18.2243 6.07951 19.4132 6.99526 19.2298C8.0113 19.0264 9.14752 18.7221 10.0954 18.2739C10.2933 18.1804 10.5134 18.144 10.7305 18.1715C11.145 18.2241 11.5695 18.2501 12 18.2501C15.3056 18.2501 18.2588 16.7186 19.0455 13.3645'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.5 4.95623C14.6424 4.66891 14.8622 4.42712 15.1347 4.25815C15.4072 4.08918 15.7216 3.99976 16.0422 4C16.3837 3.99998 16.7176 4.10158 17.0012 4.29186C17.2848 4.48213 17.5054 4.75249 17.6349 5.06852C17.7645 5.38455 17.797 5.73197 17.7285 6.06657C17.66 6.40116 17.4934 6.70781 17.2501 6.94748C16.8676 7.32461 16.4025 7.73158 16.1776 8.2097M16.0422 10.5024V10.51'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function FeedbackRequestCompleteIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10.0954 4.93176C7.08694 5.53116 4.75 7.63154 4.75 11.5001C4.75 13.2676 5.23783 14.666 6.05464 15.7207C6.29358 16.0293 6.38851 16.4393 6.2231 16.7927C6.12235 17.008 6.01633 17.2135 5.90792 17.4083C5.45369 18.2243 6.07951 19.4132 6.99526 19.2298C8.0113 19.0264 9.14752 18.7221 10.0954 18.2739C10.2933 18.1804 10.5134 18.144 10.7305 18.1715C11.145 18.2241 11.5695 18.2501 12 18.2501C15.3056 18.2501 18.2588 16.7186 19.0455 13.3645'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 9.07692L13.8529 11L19 6'
        stroke='#16A34A'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function BookWithBookmarkIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M12 5.75s-1.5-1-3.5-1-3.75 1-3.75 1v13.5s1.75-1 3.75-1 3.5 1 3.5 1m0-13.5s1.5-1 3.5-1c.255 0 .506.016.75.045M12 5.75v13.5m0 0s1.5-1 3.5-1 3.75 1 3.75 1V5.75s-1.332-.761-3-.955m0 0V9.25'
      ></path>
    </svg>
  )
}

export function AtSignIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C18.8125 4.75 19.25 9.125 19.25 12V13.25C19.25 14.3546 18.3546 15.25 17.25 15.25C16.1454 15.25 15.25 14.3546 15.25 13.25V8.75M15.25 12C15.25 13.7949 13.7949 15.25 12 15.25C10.2051 15.25 8.75 13.7949 8.75 12C8.75 10.2051 10.2051 8.75 12 8.75C13.7949 8.75 15.25 10.2051 15.25 12Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function HashtagIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M10.25 4.75L7.75 19.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M16.25 4.75L13.75 19.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M19.25 8.75H5.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M18.25 15.25H4.75'
      ></path>
    </svg>
  )
}

export function GifIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M6 12.3676V11.5986C6 10.0014 6.95493 9 8.50986 9C9.16479 9 9.74366 9.17746 10.1662 9.49437C10.5465 9.76901 10.7958 10.1324 10.7958 10.4662C10.7958 10.8 10.5634 11.0282 10.2296 11.0282C10.0648 11.0282 9.93803 10.9732 9.81549 10.8507C9.47324 10.5085 9.15634 10.1789 8.61127 10.1789C7.81268 10.1789 7.39437 10.6901 7.39437 11.6662V12.3634C7.39437 13.3268 7.82113 13.8549 8.59859 13.8549C9.20282 13.8549 9.60845 13.5 9.60845 12.9718V12.7268H9.08873C8.72113 12.7268 8.51831 12.5493 8.51831 12.2282C8.51831 11.9113 8.7169 11.738 9.08873 11.738H10.1239C10.6817 11.738 10.9268 11.9789 10.9268 12.5155V12.8662C10.9268 14.138 9.96761 15 8.54366 15C6.94225 15 6 14.0113 6 12.3676Z'
        fill='currentColor'
      />
      <path
        d='M12.3865 14.9155C11.9386 14.9155 11.6808 14.6408 11.6808 14.1634V9.81549C11.6808 9.3338 11.9301 9.06338 12.378 9.06338C12.8259 9.06338 13.0794 9.33803 13.0794 9.81549V14.1634C13.0794 14.6451 12.8301 14.9155 12.3865 14.9155Z'
        fill='currentColor'
      />
      <path
        d='M14.78 14.9155C14.3278 14.9155 14.0659 14.6366 14.0659 14.1634V9.90423C14.0659 9.38873 14.349 9.10563 14.8729 9.10563H17.4546C17.7757 9.10563 18.0081 9.34225 18.0081 9.67183C18.0081 9.99718 17.7757 10.2254 17.4546 10.2254H15.4645V11.6113H17.2391C17.5729 11.6113 17.7926 11.831 17.7926 12.1563C17.7926 12.4817 17.5687 12.7014 17.2391 12.7014H15.4645V14.1634C15.4645 14.6451 15.2194 14.9155 14.78 14.9155Z'
        fill='currentColor'
      />
      <path
        d='M3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M17.25 6.75L6.75 17.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M6.75 6.75L17.25 17.25'
      ></path>
    </svg>
  )
}

export function CircleFilledCloseIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 20C16.4183 20 20 16.4183 20 12C20 7.58173 16.4183 4 12 4C7.58173 4 4 7.58173 4 12C4 16.4183 7.58173 20 12 20ZM9.74895 8.53677C9.41422 8.20203 8.8715 8.20203 8.53677 8.53677C8.20203 8.8715 8.20203 9.41422 8.53677 9.74895L10.7878 12L8.53677 14.2511C8.20203 14.5858 8.20203 15.1285 8.53677 15.4632C8.8715 15.7979 9.41422 15.7979 9.74895 15.4632L12 13.2122L14.2511 15.4632C14.5858 15.7979 15.1285 15.7979 15.4632 15.4632C15.7979 15.1285 15.7979 14.5858 15.4632 14.2511L13.2122 12L15.4632 9.74895C15.7979 9.41422 15.7979 8.8715 15.4632 8.53677C15.1285 8.20203 14.5858 8.20203 14.2511 8.53677L12 10.7878L9.74895 8.53677Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function ForbidIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path d='M17 7L7 17' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
    </svg>
  )
}

export function ThickCloseIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.5'
        d='M17.25 6.75L6.75 17.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.5'
        d='M6.75 6.75L17.25 17.25'
      ></path>
    </svg>
  )
}

export function GithubIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.1601 3C7.0948 3 3 7.12498 3 12.2281C3 16.3074 5.62368 19.7604 9.26341 20.9825C9.71847 21.0744 9.88516 20.7839 9.88516 20.5396C9.88516 20.3257 9.87016 19.5924 9.87016 18.8283C7.32204 19.3784 6.79142 17.7283 6.79142 17.7283C6.38192 16.6588 5.77518 16.3839 5.77518 16.3839C4.94118 15.8186 5.83593 15.8186 5.83593 15.8186C6.76105 15.8797 7.24648 16.7658 7.24648 16.7658C8.06529 18.1713 9.38472 17.7742 9.91553 17.5297C9.99128 16.9338 10.2341 16.5213 10.4919 16.2922C8.4596 16.0783 6.32136 15.2838 6.32136 11.7392C6.32136 10.7308 6.68511 9.90578 7.26148 9.26416C7.17055 9.03504 6.85198 8.0876 7.35261 6.81955C7.35261 6.81955 8.12604 6.57505 9.86997 7.76679C10.6166 7.56479 11.3866 7.46203 12.1601 7.46117C12.9335 7.46117 13.722 7.56823 14.45 7.76679C16.1941 6.57505 16.9676 6.81955 16.9676 6.81955C17.4682 8.0876 17.1494 9.03504 17.0585 9.26416C17.6501 9.90578 17.9988 10.7308 17.9988 11.7392C17.9988 15.2838 15.8606 16.0629 13.8131 16.2922C14.1468 16.5824 14.4348 17.1324 14.4348 18.0033C14.4348 19.2408 14.4198 20.234 14.4198 20.5394C14.4198 20.7839 14.5867 21.0744 15.0416 20.9827C18.6813 19.7602 21.305 16.3074 21.305 12.2281C21.32 7.12498 17.2102 3 12.1601 3Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function GithubBleedIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 20 20' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.0083 0.166016C4.47396 0.166016 0 4.67295 0 10.2486C0 14.7056 2.86662 18.4784 6.84337 19.8136C7.34057 19.914 7.52269 19.5966 7.52269 19.3297C7.52269 19.096 7.5063 18.2948 7.5063 17.4599C4.72224 18.061 4.14249 16.2581 4.14249 16.2581C3.69507 15.0896 3.03215 14.7892 3.03215 14.7892C2.12092 14.1716 3.09852 14.1716 3.09852 14.1716C4.10931 14.2383 4.63968 15.2065 4.63968 15.2065C5.53431 16.7421 6.97591 16.3082 7.55588 16.0411C7.63864 15.39 7.90394 14.9393 8.18561 14.689C5.96513 14.4553 3.6289 13.5872 3.6289 9.71442C3.6289 8.61265 4.02633 7.71124 4.65607 7.01021C4.55672 6.75987 4.20866 5.7247 4.75564 4.33924C4.75564 4.33924 5.60069 4.0721 7.5061 5.37419C8.32186 5.15348 9.16316 5.04121 10.0083 5.04027C10.8533 5.04027 11.7148 5.15724 12.5102 5.37419C14.4158 4.0721 15.2609 4.33924 15.2609 4.33924C15.8079 5.7247 15.4596 6.75987 15.3603 7.01021C16.0066 7.71124 16.3876 8.61265 16.3876 9.71442C16.3876 13.5872 14.0514 14.4385 11.8143 14.689C12.1789 15.0061 12.4936 15.607 12.4936 16.5586C12.4936 17.9106 12.4772 18.9958 12.4772 19.3295C12.4772 19.5966 12.6596 19.914 13.1566 19.8138C17.1333 18.4781 20 14.7056 20 10.2486C20.0163 4.67295 15.526 0.166016 10.0083 0.166016Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function LinearIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <mask id='mask0_2721_4549' maskUnits='userSpaceOnUse' x='4' y='4' width='16' height='16'>
        <path d='M20 4H4V20H20V4Z' fill='white' />
      </mask>
      <g mask='url(#mask0_2721_4549)'>
        <path
          d='M4.19606 13.8437C4.16046 13.6919 4.34126 13.5963 4.45149 13.7066L10.2935 19.5485C10.4037 19.6587 10.3081 19.8395 10.1564 19.8039C7.20824 19.1123 4.88765 16.7918 4.19606 13.8437ZM4.0003 11.5022C3.99748 11.5476 4.01452 11.5918 4.04663 11.6239L12.3761 19.9534C12.4082 19.9854 12.4524 20.0026 12.4978 19.9997C12.8768 19.9761 13.2487 19.9261 13.6118 19.8515C13.7341 19.8264 13.7766 19.6762 13.6882 19.5878L4.41215 10.3118C4.32385 10.2235 4.17357 10.266 4.14845 10.3883C4.07389 10.7513 4.02391 11.1232 4.0003 11.5022ZM4.67375 8.75286C4.64711 8.81267 4.66068 8.88256 4.70697 8.92886L15.0711 19.293C15.1174 19.3394 15.1874 19.3529 15.2471 19.3262C15.5329 19.199 15.8098 19.0554 16.0768 18.8968C16.1651 18.8443 16.1788 18.723 16.1062 18.6503L5.3497 7.89387C5.27705 7.82122 5.15567 7.83485 5.10318 7.92318C4.94457 8.19013 4.80104 8.46709 4.67375 8.75286ZM6.02539 6.89184C5.96617 6.83262 5.96251 6.73765 6.0183 6.67518C7.48472 5.03349 9.61782 4 11.9923 4C16.4148 4 20 7.58517 20 12.0077C20 14.3822 18.9665 16.5153 17.3248 17.9817C17.2624 18.0375 17.1674 18.0338 17.1082 17.9746L6.02539 6.89184Z'
          fill='currentColor'
        />
      </g>
    </svg>
  )
}

export function ZapierIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6 4C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6ZM8 15C7.44772 15 7 15.4477 7 16C7 16.5523 7.44772 17 8 17H16C16.5523 17 17 16.5523 17 16C17 15.4477 16.5523 15 16 15H8Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function GoogleIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M20 12.1777C20 11.5199 19.9455 11.0399 19.8277 10.5421H12.1632V13.511H16.6621C16.5714 14.2488 16.0816 15.3599 14.9932 16.1066L14.9779 16.2059L17.4013 18.0457L17.5691 18.0622C19.1111 16.6666 20 14.6132 20 12.1777Z'
        fill='currentColor'
      />
      <path
        d='M12.1623 20.0001C14.3664 20.0001 16.2176 19.2888 17.5691 18.0622L14.9932 16.1066C14.3038 16.5777 13.3777 16.9066 12.1623 16.9066C10.0036 16.9066 8.17143 15.5111 7.51831 13.5822L7.42258 13.5902L4.90275 15.5013L4.8698 15.5911C6.21219 18.2044 8.96956 20.0001 12.1623 20.0001Z'
        fill='currentColor'
      />
      <path
        d='M7.51831 13.5822C7.34598 13.0844 7.24718 12.5511 7.24718 12C7.24718 11.4488 7.34692 10.9155 7.51018 10.4178L7.50562 10.3117L4.95421 8.36992L4.87073 8.40884C4.31746 9.4933 4 10.7111 4 12C4 13.2889 4.31653 14.5066 4.8698 15.5911L7.51831 13.5822Z'
        fill='currentColor'
      />
      <path
        d='M12.1624 7.09333C13.6952 7.09333 14.7292 7.74221 15.3188 8.28448L17.6227 6.08001C16.2078 4.79112 14.3664 4 12.1624 4C8.96959 4 6.21313 5.79551 4.87073 8.40884L7.51018 10.4178C8.17238 8.48887 10.0036 7.09333 12.1624 7.09333Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function LinearBacklogIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M19.9323 13.0449L17.6658 12.7492C17.6977 12.505 17.7143 12.255 17.7143 12C17.7143 11.745 17.6977 11.495 17.6658 11.2508L19.9323 10.9551C19.977 11.2971 20 11.6459 20 12C20 12.3541 19.977 12.7029 19.9323 13.0449ZM19.3929 8.9377C19.1232 8.28731 18.7702 7.68022 18.3472 7.12973L16.5349 8.52247C16.8375 8.9164 17.0895 9.34993 17.2816 9.81325L19.3929 8.9377ZM16.8703 5.6528L15.4775 7.46519C15.0836 7.16247 14.6501 6.91055 14.1868 6.71842L15.0623 4.60704C15.7127 4.87675 16.3198 5.22977 16.8703 5.6528ZM13.0449 4.06762L12.7492 6.33414C12.505 6.30227 12.255 6.28571 12 6.28571C11.745 6.28571 11.495 6.30227 11.2508 6.33414L10.9551 4.06762C11.2971 4.02301 11.6459 4 12 4C12.3541 4 12.7029 4.02301 13.0449 4.06762ZM8.9377 4.60704L9.81325 6.71842C9.34993 6.91055 8.9164 7.16247 8.52247 7.46519L7.12973 5.6528C7.68022 5.22977 8.28731 4.87675 8.9377 4.60704ZM5.6528 7.12973L7.46519 8.52247C7.16247 8.9164 6.91055 9.34993 6.71842 9.81325L4.60704 8.9377C4.87675 8.28731 5.22977 7.68022 5.6528 7.12973ZM4.06762 10.9551C4.02301 11.2971 4 11.6459 4 12C4 12.3541 4.02301 12.7029 4.06762 13.0449L6.33414 12.7492C6.30227 12.505 6.28571 12.255 6.28571 12C6.28571 11.745 6.30227 11.495 6.33414 11.2508L4.06762 10.9551ZM4.60704 15.0623L6.71842 14.1868C6.91055 14.6501 7.16247 15.0836 7.46519 15.4775L5.6528 16.8703C5.22977 16.3198 4.87675 15.7127 4.60704 15.0623ZM7.12973 18.3472L8.52247 16.5349C8.9164 16.8375 9.34993 17.0895 9.81325 17.2816L8.9377 19.3929C8.28731 19.1232 7.68022 18.7702 7.12973 18.3472ZM10.9551 19.9323L11.2508 17.6658C11.495 17.6977 11.745 17.7143 12 17.7143C12.255 17.7143 12.505 17.6977 12.7492 17.6658L13.0449 19.9323C12.7029 19.977 12.3541 20 12 20C11.6459 20 11.2971 19.977 10.9551 19.9323ZM15.0623 19.3929L14.1868 17.2816C14.6501 17.0895 15.0836 16.8375 15.4775 16.5349L16.8703 18.3472C16.3198 18.7702 15.7127 19.1232 15.0623 19.3929ZM18.3472 16.8703L16.5349 15.4775C16.8375 15.0836 17.0895 14.6501 17.2816 14.1868L19.3929 15.0623C19.1232 15.7127 18.7703 16.3198 18.3472 16.8703Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function LinearTodoIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12Z'
        stroke='currentColor'
        strokeWidth='2'
      />
    </svg>
  )
}

export function LinearInProgressIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12Z'
        stroke='currentColor'
        strokeWidth='2'
      />
      <path
        d='M12 12V7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17V12Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function LinearInReviewIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12Z'
        stroke='currentColor'
        strokeWidth='2'
      />
      <path
        d='M12 12V7C12.9889 7 13.9556 7.29324 14.7778 7.84265C15.6001 8.39206 16.241 9.17295 16.6194 10.0866C16.9978 11.0002 17.0968 12.0055 16.9039 12.9755C16.711 13.9454 16.2348 14.8363 15.5355 15.5355C14.8363 16.2348 13.9454 16.711 12.9755 16.9039C12.0055 17.0968 11.0002 16.9978 10.0866 16.6194C9.17295 16.241 8.39206 15.6001 7.84265 14.7778C7.29324 13.9556 7 12.9889 7 12H12Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function LinearDoneIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 4C7.58173 4 4 7.58173 4 12C4 16.4183 7.58173 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58173 16.4183 4 12 4ZM16.6869 9.82976C17.0663 9.45039 17.0663 8.83533 16.6869 8.45595C16.3075 8.07658 15.6925 8.07658 15.3131 8.45595L10.2857 13.4833L8.6869 11.8845C8.30754 11.5052 7.69246 11.5052 7.3131 11.8845C6.93373 12.2639 6.93373 12.879 7.3131 13.2583L9.59881 15.544C9.97817 15.9234 10.5933 15.9234 10.9726 15.544L16.6869 9.82976Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function LinearCanceledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 20C16.4183 20 20 16.4183 20 12C20 7.58173 16.4183 4 12 4C7.58173 4 4 7.58173 4 12C4 16.4183 7.58173 20 12 20ZM9.74895 8.53677C9.41422 8.20203 8.8715 8.20203 8.53677 8.53677C8.20203 8.8715 8.20203 9.41422 8.53677 9.74895L10.7878 12L8.53677 14.2511C8.20203 14.5858 8.20203 15.1285 8.53677 15.4632C8.8715 15.7979 9.41422 15.7979 9.74895 15.4632L12 13.2122L14.2511 15.4632C14.5858 15.7979 15.1285 15.7979 15.4632 15.4632C15.7979 15.1285 15.7979 14.5858 15.4632 14.2511L13.2122 12L15.4632 9.74895C15.7979 9.41422 15.7979 8.8715 15.4632 8.53677C15.1285 8.20203 14.5858 8.20203 14.2511 8.53677L12 10.7878L9.74895 8.53677Z'
        fill='currentColor'
      />
    </svg>
  )
}
export function LinearTriageIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10.694 11.2857V9.75078C10.694 9.21023 10.0643 8.93952 9.69608 9.32175L7.59993 11.4974C7.37164 11.7344 7.37164 12.1185 7.59993 12.3555L9.86731 14.7089C10.1724 15.0255 10.694 14.8013 10.694 14.3535V12.7142H13.3063V14.2491C13.3063 14.7897 13.9359 15.0603 14.3041 14.6782L16.4004 12.5025C16.6286 12.2655 16.6286 11.8814 16.4004 11.6444L14.133 9.29105C13.8279 8.9744 13.3063 9.19867 13.3063 9.64647V11.2857H10.694Z'
        fill='currentColor'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M20 12C20 16.4182 16.4183 20 12 20C7.58173 20 4 16.4182 4 12C4 7.58171 7.58173 4 12 4C16.4183 4 20 7.58171 20 12ZM18.2857 12C18.2857 15.4714 15.4715 18.2857 12 18.2857C8.52849 18.2857 5.71429 15.4714 5.71429 12C5.71429 8.52848 8.52849 5.71428 12 5.71428C15.4715 5.71428 18.2857 8.52848 18.2857 12Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function LinearAppIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M0.245082 12.3046C0.200582 12.1149 0.426578 11.9954 0.564358 12.1332L7.86684 19.4356C8.00462 19.5734 7.88514 19.7994 7.69544 19.7549C4.0103 18.8904 1.10956 15.9897 0.245082 12.3046ZM0.000378269 9.37782C-0.00315048 9.43448 0.0181527 9.4898 0.0582926 9.52994L10.4701 19.9417C10.5102 19.9818 10.5655 20.0032 10.6222 19.9996C11.096 19.9701 11.5609 19.9076 12.0147 19.8144C12.1676 19.783 12.2207 19.5952 12.1103 19.4848L0.51519 7.8897C0.404818 7.77932 0.216956 7.83244 0.185555 7.98534C0.0923722 8.43906 0.0298912 8.90398 0.000378269 9.37782ZM0.842186 5.94108C0.808888 6.01584 0.825848 6.1032 0.883716 6.16108L13.8389 19.1163C13.8968 19.1742 13.9842 19.1911 14.0589 19.1578C14.4161 18.9987 14.7623 18.8193 15.096 18.621C15.2064 18.5554 15.2235 18.4037 15.1327 18.3129L1.68713 4.86734C1.59631 4.77652 1.44459 4.79356 1.37898 4.90398C1.18072 5.23766 1.0013 5.58386 0.842186 5.94108ZM2.53174 3.6148C2.45772 3.54078 2.45314 3.42206 2.52288 3.34398C4.3559 1.29186 7.02228 0 9.99038 0C15.5185 0 20 4.48146 20 10.0096C20 12.9777 18.7081 15.6441 16.656 17.4771C16.578 17.5469 16.4592 17.5423 16.3852 17.4683L2.53174 3.6148Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function BroadcastIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12.5 10C12.5 10.2761 12.2761 10.5 12 10.5C11.7239 10.5 11.5 10.2761 11.5 10C11.5 9.72386 11.7239 9.5 12 9.5C12.2761 9.5 12.5 9.72386 12.5 10Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M9.24993 13.2499C7.21088 11.5624 7.33603 8.49988 9.25002 6.74988'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M14.7673 13.25C16.8063 11.5625 16.6812 8.5 14.7672 6.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12.25 12.75H11.75L9.75 19.25H14.25L12.25 12.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M7.24999 15.2501C3.91407 11.9141 3.92971 8.07812 7.24994 4.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M16.7539 15.2501C20.0898 11.9141 20.0742 8.07812 16.754 4.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 14.25C11.5858 14.25 11.25 14.5858 11.25 15C11.25 15.4142 11.5858 15.75 12 15.75V14.25ZM12.01 15.75C12.4242 15.75 12.76 15.4142 12.76 15C12.76 14.5858 12.4242 14.25 12.01 14.25V15.75ZM12 15.75H12.01V14.25H12V15.75Z'
        fill='currentColor'
      ></path>
      <path
        d='M10.4033 5.41136L10.9337 5.94169L10.4033 5.41136ZM5.41136 10.4033L4.88103 9.87301L4.88103 9.87301L5.41136 10.4033ZM5.41136 13.5967L5.94169 13.0663L5.94169 13.0663L5.41136 13.5967ZM10.4033 18.5886L10.9337 18.0583L10.4033 18.5886ZM13.5967 18.5886L14.127 19.119L14.127 19.119L13.5967 18.5886ZM18.5886 10.4033L19.119 9.87301L19.119 9.87301L18.5886 10.4033ZM13.5967 5.41136L14.127 4.88103L14.127 4.88103L13.5967 5.41136ZM9.87301 4.88103L4.88103 9.87301L5.94169 10.9337L10.9337 5.94169L9.87301 4.88103ZM4.88103 14.127L9.87301 19.119L10.9337 18.0583L5.94169 13.0663L4.88103 14.127ZM14.127 19.119L19.119 14.127L18.0583 13.0663L13.0663 18.0583L14.127 19.119ZM19.119 9.87301L14.127 4.88103L13.0663 5.94169L18.0583 10.9337L19.119 9.87301ZM19.119 14.127C20.2937 12.9523 20.2937 11.0477 19.119 9.87301L18.0583 10.9337C18.6472 11.5226 18.6472 12.4774 18.0583 13.0663L19.119 14.127ZM9.87301 19.119C11.0477 20.2937 12.9523 20.2937 14.127 19.119L13.0663 18.0583C12.4774 18.6472 11.5226 18.6472 10.9337 18.0583L9.87301 19.119ZM4.88103 9.87301C3.70632 11.0477 3.70632 12.9523 4.88103 14.127L5.94169 13.0663C5.35277 12.4774 5.35277 11.5226 5.94169 10.9337L4.88103 9.87301ZM10.9337 5.94169C11.5226 5.35277 12.4774 5.35277 13.0663 5.94169L14.127 4.88103C12.9523 3.70632 11.0477 3.70632 9.87301 4.88103L10.9337 5.94169Z'
        fill='currentColor'
      ></path>
      <path
        d='M12 8.75V12.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M6 10.8077L8.38235 13.5L15 6.5'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function BookmarkIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M6.75 6.75C6.75 5.64543 7.64543 4.75 8.75 4.75H15.25C16.3546 4.75 17.25 5.64543 17.25 6.75V19.25L12 14.75L6.75 19.25V6.75Z'
      ></path>
    </svg>
  )
}

export function BadgeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10.705 5.23067C11.4528 4.5934 12.5526 4.5934 13.3004 5.23067L13.9215 5.76C14.242 6.03308 14.6404 6.19812 15.0601 6.23161L15.8736 6.29653C16.853 6.37468 17.6307 7.15239 17.7089 8.13178L17.7738 8.94529C17.8073 9.36498 17.9723 9.76341 18.2454 10.0839L18.7747 10.705C19.412 11.4528 19.412 12.5526 18.7747 13.3004L18.2454 13.9216C17.9723 14.242 17.8073 14.6405 17.7738 15.0601L17.7089 15.8736C17.6307 16.853 16.853 17.6308 15.8736 17.7089L15.0601 17.7738C14.6404 17.8073 14.242 17.9724 13.9215 18.2454L13.3004 18.7748C12.5526 19.412 11.4528 19.412 10.705 18.7748L10.0838 18.2454C9.76338 17.9724 9.36495 17.8073 8.94526 17.7738L8.13175 17.7089C7.15237 17.6308 6.37465 16.853 6.29649 15.8737L6.23158 15.0601C6.19809 14.6405 6.03305 14.242 5.75997 13.9216L5.23064 13.3004C4.59337 12.5526 4.59337 11.4528 5.23064 10.705L5.75997 10.0839C6.03305 9.76341 6.19808 9.36498 6.23158 8.94529L6.29649 8.13178C6.37465 7.1524 7.15236 6.37468 8.13175 6.29653L8.94526 6.23161C9.36495 6.19812 9.76338 6.03308 10.0838 5.76L10.705 5.23067Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function CheckCircleIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 12.0952L10.8621 14L15 10'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ResolvePostIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M9 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.2502C18.3548 19.25 19.2502 18.3546 19.2502 17.25C19.2502 17.25 19.2502 18.4171 19.2502 15'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M8 13H11' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <path d='M8 16H14' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <path
        d='M9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M17 2C14.2386 2 12 4.23858 12 7C12 9.76145 14.2386 12 17 12C19.7614 12 22 9.76145 22 7C22 4.23858 19.7614 2 17 2ZM19.357 6.24328C19.5432 6.06335 19.5482 5.76659 19.3683 5.58046C19.1883 5.39432 18.8916 5.38929 18.7055 5.56922L16.4544 7.74526L15.6164 6.8881C15.4355 6.70297 15.1387 6.69961 14.9536 6.88058C14.7685 7.06155 14.7651 7.35833 14.9461 7.54345L16.1099 8.73393C16.2901 8.91831 16.5854 8.92249 16.7708 8.74328L19.357 6.24328Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function UnresolvePostIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10.5 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.2502C18.3548 19.25 19.2502 18.3546 19.2502 17.25C19.2502 17.25 19.2502 16.9171 19.2502 13.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M8 12.5H16' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <path d='M8 16H14' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <path
        d='M17.1905 7.88235L16 8.94118M16 8.94118L17.1905 10M16 8.94118H18.1429C19.7208 8.94118 21 7.67704 21 6.11765V6'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19 4.05882H16.8571C15.2792 4.05882 14 5.32296 14 6.88235V7M19 4.05882L17.8095 5.11765M19 4.05882L17.8095 3'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function CheckCircleFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 4C7.58173 4 4 7.58173 4 12C4 16.4183 7.58173 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58173 16.4183 4 12 4ZM15.7713 10.7892C16.0691 10.5014 16.0771 10.0265 15.7892 9.72873C15.5014 9.43092 15.0265 9.42287 14.7287 9.71076L11.127 13.1924L9.78631 11.821C9.49675 11.5248 9.02191 11.5194 8.72571 11.8089C8.42952 12.0985 8.42414 12.5733 8.71369 12.8695L10.5758 14.7743C10.8642 15.0693 11.3367 15.076 11.6333 14.7892L15.7713 10.7892Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function CheckCircleFilledFlushIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 1C5.92487 1 1 5.92487 1 12C1 18.0752 5.92487 23 12 23C18.0752 23 23 18.0752 23 12C23 5.92487 18.0752 1 12 1ZM17.1855 10.3352C17.595 9.93936 17.6061 9.2865 17.2102 8.87701C16.8144 8.46751 16.1615 8.45645 15.752 8.85229L10.7997 13.6396L8.95617 11.7538C8.55803 11.3465 7.90512 11.3391 7.49786 11.7373C7.09059 12.1354 7.08319 12.7883 7.48133 13.1956L10.0417 15.8146C10.4382 16.2203 11.088 16.2295 11.4958 15.8352L17.1855 10.3352Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function TrashIcon(props: AnimatedIconProps) {
  const { isAnimated = false, size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M4.7915 6.45837L5.49246 14.5195C5.56735 15.3807 6.28835 16.0417 7.15286 16.0417H12.0135C12.878 16.0417 13.599 15.3807 13.6738 14.5195L14.3748 6.45837H4.7915Z'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.125 8.95837V13.5417'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M11.0415 8.95837V13.5417'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M4.9585 6.45837H14.2085'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <g
        className={
          isAnimated
            ? 'transition-transform group-hover:translate-x-[-.75px] group-hover:translate-y-[-1.75px] group-hover:rotate-[-5deg]'
            : ''
        }
      >
        <path
          d='M7.2915 6.45837V5.62504C7.2915 4.70457 8.0377 3.95837 8.95817 3.95837H10.2082C11.1287 3.95837 11.8748 4.70457 11.8748 5.62504V6.45837'
          stroke='currentColor'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.9585 6.45837H15.2085'
          stroke='currentColor'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
    </svg>
  )
}

export function VideoIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.25 12L9.75 8.75V15.25L15.25 12Z'
      ></path>
    </svg>
  )
}

export function StickyNoteIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M13.75 19.25h-7a2 2 0 0 1-2-2V6.75a2 2 0 0 1 2-2h10.5a2 2 0 0 1 2 2v7m-5.5 5.5 5.5-5.5m-5.5 5.5v-4.5a1 1 0 0 1 1-1h4.5'
      ></path>
    </svg>
  )
}

export function StarFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M11.9333 3.63043C12.12 3.0931 12.88 3.0931 13.0667 3.63043L14.8316 8.70776C14.914 8.9448 15.1352 9.10552 15.3861 9.11064L20.7603 9.22015C21.3291 9.23174 21.5639 9.95447 21.1106 10.2982L16.8271 13.5456C16.6272 13.6972 16.5427 13.9573 16.6153 14.1975L18.1719 19.3425C18.3366 19.887 17.7218 20.3337 17.2549 20.0088L12.8427 16.9385C12.6367 16.7951 12.3633 16.7951 12.1573 16.9385L7.7451 20.0088C7.27816 20.3337 6.66337 19.887 6.8281 19.3425L8.38466 14.1975C8.45733 13.9573 8.37283 13.6972 8.17285 13.5456L3.88941 10.2982C3.43609 9.95447 3.67092 9.23174 4.23967 9.22015L9.61387 9.11064C9.86477 9.10552 10.086 8.9448 10.1684 8.70776L11.9333 3.63043Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='1.5'
      />
    </svg>
  )
}

export function StarOutlineIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M11.2443 4.17391C11.4934 3.45746 12.5066 3.45746 12.7557 4.17391L14.1684 8.2381C14.2782 8.55416 14.5732 8.76846 14.9077 8.77527L19.2095 8.86294C19.9679 8.87839 20.281 9.84203 19.6766 10.3003L16.2478 12.8997C15.9812 13.1019 15.8685 13.4486 15.9654 13.7689L17.2114 17.8873C17.431 18.6133 16.6113 19.2088 15.9887 18.7756L12.4569 16.318C12.1823 16.1268 11.8177 16.1268 11.5431 16.318L8.01128 18.7756C7.38868 19.2088 6.56896 18.6133 6.78861 17.8873L8.03457 13.7689C8.13146 13.4486 8.0188 13.1019 7.75216 12.8997L4.32344 10.3003C3.71901 9.84203 4.03212 8.87839 4.79046 8.86294L9.09228 8.77527C9.42682 8.76846 9.72178 8.55416 9.83164 8.2381L11.2443 4.17391Z'
        stroke='currentColor'
        strokeWidth='1.5'
      />
    </svg>
  )
}

export function StaticTrashIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M5.75 7.75L6.59115 17.4233C6.68102 18.4568 7.54622 19.25 8.58363 19.25H14.4164C15.4538 19.25 16.319 18.4568 16.4088 17.4233L17.25 7.75H5.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M9.75 10.75V16.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M13.25 10.75V16.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M8.75 7.75V6.75C8.75 5.64543 9.64543 4.75 10.75 4.75H12.25C13.3546 4.75 14.25 5.64543 14.25 6.75V7.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 7.75H18.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function VideoCameraIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='m15.25 10 4-1.25v6.5l-4-1.25M4.75 8.75v6.5a2 2 0 0 0 2 2h8.5V6.75h-8.5a2 2 0 0 0-2 2Z'
      ></path>
    </svg>
  )
}

export function VideoCameraBoltIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M15.25 10L19.25 8.75V15.25L15.25 14M4.75 11.5V8.75C4.75 8.21957 4.96071 7.71086 5.33579 7.33579C5.71086 6.96071 6.21957 6.75 6.75 6.75H15.25V17.25H13M8.5 12.5C7.91421 13.8668 7 16 7 16H9.5L8 19'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function VideoCameraFilledIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M4.75 8.75V15.25C4.75 15.7804 4.96071 16.2891 5.33579 16.6642C5.71086 17.0393 6.21957 17.25 6.75 17.25H14.5V6.75H6.75C6.21957 6.75 5.71086 6.96071 5.33579 7.33579C4.96071 7.71086 4.75 8.21957 4.75 8.75Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19.25 8.75L17.5 9.5V14.5L19.25 15.25V8.75Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function VideoCameraOffIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M4.75 8.75v6.5a2 2 0 0 0 2 2h5.5m-5.5-10.5h8.5V10m-8.5-3.25-2-2m2 2 8.5 8.5m0 0V14m0 1.25 4 4m-4-5.25v-4m0 4 4 1.25v-6.5l-4 1.25'
      ></path>
    </svg>
  )
}

export function MicrophoneIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M8.75 8C8.75 6.20507 10.2051 4.75 12 4.75C13.7949 4.75 15.25 6.20507 15.25 8V11C15.25 12.7949 13.7949 14.25 12 14.25C10.2051 14.25 8.75 12.7949 8.75 11V8Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M5.75 12.75C5.75 12.75 6 17.25 12 17.25C18 17.25 18.25 12.75 18.25 12.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M12 17.75V19.25'
      ></path>
    </svg>
  )
}

export function MicrophoneMuteIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M15.25 8.5V8C15.25 6.20507 13.7949 4.75 12 4.75C10.2051 4.75 8.75 6.20507 8.75 8V11.1802C8.75 11.2267 8.7507 11.2721 8.75373 11.3185C8.77848 11.6975 8.95343 13.5309 10.0312 13.7969'
      />
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M18.25 12.75C18.25 12.75 18 17.25 12 17.25C11.6576 17.25 11.334 17.2353 11.028 17.2077M5.75 12.75C5.75 12.75 5.85507 14.6412 7.56374 15.9716'
      />
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M12 17.75V19.25'
      />
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M18.25 5.75L5.75 18.25'
      />
    </svg>
  )
}

export function GridIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 5.75C4.75 5.19772 5.19772 4.75 5.75 4.75H9.25C9.80228 4.75 10.25 5.19772 10.25 5.75V9.25C10.25 9.80228 9.80228 10.25 9.25 10.25H5.75C5.19772 10.25 4.75 9.80228 4.75 9.25V5.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 14.75C4.75 14.1977 5.19772 13.75 5.75 13.75H9.25C9.80228 13.75 10.25 14.1977 10.25 14.75V18.25C10.25 18.8023 9.80228 19.25 9.25 19.25H5.75C5.19772 19.25 4.75 18.8023 4.75 18.25V14.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M13.75 5.75C13.75 5.19772 14.1977 4.75 14.75 4.75H18.25C18.8023 4.75 19.25 5.19772 19.25 5.75V9.25C19.25 9.80228 18.8023 10.25 18.25 10.25H14.75C14.1977 10.25 13.75 9.80228 13.75 9.25V5.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M13.75 14.75C13.75 14.1977 14.1977 13.75 14.75 13.75H18.25C18.8023 13.75 19.25 14.1977 19.25 14.75V18.25C19.25 18.8023 18.8023 19.25 18.25 19.25H14.75C14.1977 19.25 13.75 18.8023 13.75 18.25V14.75Z'
      ></path>
    </svg>
  )
}

export function GridFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M4.75 5.75C4.75 5.19772 5.19772 4.75 5.75 4.75H9.25C9.80228 4.75 10.25 5.19772 10.25 5.75V9.25C10.25 9.80228 9.80228 10.25 9.25 10.25H5.75C5.19772 10.25 4.75 9.80228 4.75 9.25V5.75Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M4.75 14.75C4.75 14.1977 5.19772 13.75 5.75 13.75H9.25C9.80228 13.75 10.25 14.1977 10.25 14.75V18.25C10.25 18.8023 9.80228 19.25 9.25 19.25H5.75C5.19772 19.25 4.75 18.8023 4.75 18.25V14.75Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M13.75 5.75C13.75 5.19772 14.1977 4.75 14.75 4.75H18.25C18.8023 4.75 19.25 5.19772 19.25 5.75V9.25C19.25 9.80228 18.8023 10.25 18.25 10.25H14.75C14.1977 10.25 13.75 9.80228 13.75 9.25V5.75Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M13.75 14.75C13.75 14.1977 14.1977 13.75 14.75 13.75H18.25C18.8023 13.75 19.25 14.1977 19.25 14.75V18.25C19.25 18.8023 18.8023 19.25 18.25 19.25H14.75C14.1977 19.25 13.75 18.8023 13.75 18.25V14.75Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ArrowRightCircleIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.25 19.5C8.2459 19.5 5 16.2541 5 12.25C5 8.24594 8.2459 5 12.25 5C16.2541 5 19.5 8.24594 19.5 12.25C19.5 16.2541 16.2541 19.5 12.25 19.5ZM13.4673 9.2979C13.2176 9.05957 12.822 9.06877 12.5836 9.31845C12.3453 9.56814 12.3545 9.96376 12.6042 10.2021L14.0948 11.625H8.75C8.40482 11.625 8.125 11.9048 8.125 12.25C8.125 12.5952 8.40482 12.875 8.75 12.875H14.0948L12.6042 14.2979C12.3545 14.5362 12.3453 14.9319 12.5836 15.1815C12.822 15.4312 13.2176 15.4404 13.4673 15.2021L16.0863 12.7021C16.2099 12.5842 16.2798 12.4208 16.2798 12.25C16.2798 12.0792 16.2099 11.9158 16.0863 11.7979L13.4673 9.2979Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function ArrowUpRightCircleIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M14.25 13.25V9.75H10.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M14 10L9.75 14.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ArrowDownIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M17.25 13.75L12 19.25L6.75 13.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M12 18.25V4.75'
      ></path>
    </svg>
  )
}

export function ArrowUpIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M17.25 10.25L12 4.75L6.75 10.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M12 19.25V5.75'
      ></path>
    </svg>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M10.25 6.75L4.75 12L10.25 17.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M19.25 12H5'
      ></path>
    </svg>
  )
}

export function SparklesIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M17 4.75C17 5.89705 15.8971 7 14.75 7C15.8971 7 17 8.10295 17 9.25C17 8.10295 18.1029 7 19.25 7C18.1029 7 17 5.89705 17 4.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M17 14.75C17 15.8971 15.8971 17 14.75 17C15.8971 17 17 18.1029 17 19.25C17 18.1029 18.1029 17 19.25 17C18.1029 17 17 15.8971 17 14.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M9 7.75C9 9.91666 6.91666 12 4.75 12C6.91666 12 9 14.0833 9 16.25C9 14.0833 11.0833 12 13.25 12C11.0833 12 9 9.91666 9 7.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ShieldTickIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 4.75L4.75002 8C4.75002 8 4.00002 19.25 12 19.25C20 19.25 19.25 8 19.25 8L12 4.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M9.75 12.75L11 14.25L14.25 9.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function DotsHorizontal() {
  return (
    <svg width={24} height={24} fill='none' viewBox='0 0 24 24'>
      <circle cx='7' cy='12' r='1.2' fill='currentColor' />
      <circle cx='12' cy='12' r='1.2' fill='currentColor' />
      <circle cx='17' cy='12' r='1.2' fill='currentColor' />
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M6.75024 19.2502H17.2502C18.3548 19.2502 19.2502 18.3548 19.2502 17.2502V9.75025L12.0002 4.75024L4.75024 9.75025V17.2502C4.75024 18.3548 5.64568 19.2502 6.75024 19.2502Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M9.74963 15.7493C9.74963 14.6447 10.6451 13.7493 11.7496 13.7493H12.2496C13.3542 13.7493 14.2496 14.6447 14.2496 15.7493V19.2493H9.74963V15.7493Z'
      ></path>
    </svg>
  )
}

export function ExpandIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M4.75 14.75V19.25H9.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M19.25 9.25V4.75H14.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M5 19L10.25 13.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M19 5L13.75 10.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function MinimizeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10.25 18.25V13.75H5.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M13.75 5.75V10.25H18.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 19.25L10.25 13.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M19.25 4.75L13.75 10.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ClipboardIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M9 6.75H7.75C6.64543 6.75 5.75 7.64543 5.75 8.75V17.25C5.75 18.3546 6.64543 19.25 7.75 19.25H16.25C17.3546 19.25 18.25 18.3546 18.25 17.25V8.75C18.25 7.64543 17.3546 6.75 16.25 6.75H15'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M14 8.25H10C9.44772 8.25 9 7.80228 9 7.25V5.75C9 5.19772 9.44772 4.75 10 4.75H14C14.5523 4.75 15 5.19772 15 5.75V7.25C15 7.80228 14.5523 8.25 14 8.25Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M9.75 12.25H14.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M9.75 15.25H14.25'
      ></path>
    </svg>
  )
}

export function GearIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M5.62117 14.9627L6.72197 15.1351C7.53458 15.2623 8.11491 16.0066 8.05506 16.8451L7.97396 17.9816C7.95034 18.3127 8.12672 18.6244 8.41885 18.7686L9.23303 19.1697C9.52516 19.3139 9.87399 19.2599 10.1126 19.0352L10.9307 18.262C11.5339 17.6917 12.4646 17.6917 13.0685 18.262L13.8866 19.0352C14.1252 19.2608 14.4733 19.3139 14.7662 19.1697L15.5819 18.7678C15.8733 18.6244 16.0489 18.3135 16.0253 17.9833L15.9441 16.8451C15.8843 16.0066 16.4646 15.2623 17.2772 15.1351L18.378 14.9627C18.6985 14.9128 18.9568 14.6671 19.0292 14.3433L19.23 13.4428C19.3025 13.119 19.1741 12.7831 18.9064 12.5962L17.9875 11.9526C17.3095 11.4774 17.1024 10.5495 17.5119 9.82051L18.067 8.83299C18.2284 8.54543 18.2017 8.18538 17.9993 7.92602L17.4363 7.2035C17.2339 6.94413 16.8969 6.83701 16.5867 6.93447L15.5221 7.26794C14.7355 7.51441 13.8969 7.1012 13.5945 6.31908L13.1866 5.26148C13.0669 4.95218 12.7748 4.7492 12.4496 4.75L11.5472 4.75242C11.222 4.75322 10.9307 4.95782 10.8126 5.26793L10.4149 6.31344C10.1157 7.1004 9.27319 7.51683 8.4842 7.26874L7.37553 6.92078C7.0645 6.82251 6.72591 6.93044 6.52355 7.19142L5.96448 7.91474C5.76212 8.17652 5.73771 8.53738 5.90228 8.82493L6.47 9.81487C6.88812 10.5446 6.68339 11.4814 6.00149 11.9591L5.0936 12.5954C4.82588 12.7831 4.69754 13.119 4.76998 13.442L4.97077 14.3425C5.04242 14.6671 5.30069 14.9128 5.62117 14.9627Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M13.5911 10.4089C14.4696 11.2875 14.4696 12.7125 13.5911 13.5911C12.7125 14.4696 11.2875 14.4696 10.4089 13.5911C9.53036 12.7125 9.53036 11.2875 10.4089 10.4089C11.2875 9.53036 12.7125 9.53036 13.5911 10.4089Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function UserCircleIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M18.5 12C18.5 15.5899 15.5899 18.5 12 18.5V20C16.4183 20 20 16.4183 20 12H18.5ZM12 18.5C8.41015 18.5 5.5 15.5899 5.5 12H4C4 16.4183 7.58172 20 12 20V18.5ZM5.5 12C5.5 8.41015 8.41015 5.5 12 5.5V4C7.58172 4 4 7.58172 4 12H5.5ZM12 5.5C15.5899 5.5 18.5 8.41015 18.5 12H20C20 7.58172 16.4183 4 12 4V5.5Z'
        fill='currentColor'
      ></path>
      <path
        d='M13.5 10C13.5 10.8284 12.8284 11.5 12 11.5V13C13.6569 13 15 11.6569 15 10H13.5ZM12 11.5C11.1716 11.5 10.5 10.8284 10.5 10H9C9 11.6569 10.3431 13 12 13V11.5ZM10.5 10C10.5 9.17157 11.1716 8.5 12 8.5V7C10.3431 7 9 8.34315 9 10H10.5ZM12 8.5C12.8284 8.5 13.5 9.17157 13.5 10H15C15 8.34315 13.6569 7 12 7V8.5Z'
        fill='currentColor'
      ></path>
      <path
        d='M6.62148 16.5197C6.35622 16.8378 6.39908 17.3108 6.71721 17.576C7.03535 17.8413 7.50828 17.7984 7.77354 17.4803L6.62148 16.5197ZM16.2266 17.4803C16.4918 17.7984 16.9648 17.8413 17.2829 17.576C17.601 17.3108 17.6439 16.8378 17.3786 16.5197L16.2266 17.4803ZM7.77354 17.4803C8.78362 16.2689 10.3017 15.5 12.0001 15.5V14C9.83796 14 7.90434 14.9811 6.62148 16.5197L7.77354 17.4803ZM12.0001 15.5C13.6984 15.5 15.2165 16.2689 16.2266 17.4803L17.3786 16.5197C16.0958 14.9811 14.1622 14 12.0001 14V15.5Z'
        fill='currentColor'
      ></path>
    </svg>
  )
}

export function UserLinkIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 11.25C13.7949 11.25 15.25 9.79493 15.25 8C15.25 6.20507 13.7949 4.75 12 4.75C10.2051 4.75 8.75 6.20507 8.75 8C8.75 9.79493 10.2051 11.25 12 11.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9.5 14.3237C7.31894 14.8921 6.13266 16.1118 5.49106 17.1953C4.8901 18.2102 5.77025 19.2499 6.94974 19.2499H9.59998'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M18.826 17L19.4147 16.4113C20.1951 15.6309 20.1951 14.3656 19.4147 13.5853C18.6343 12.8049 17.3691 12.8049 16.5887 13.5853L16 14.174'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.174 16L13.5853 16.5887C12.8049 17.3691 12.8049 18.6343 13.5853 19.4147C14.3656 20.1951 15.6309 20.1951 16.4113 19.4147L17 18.826'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M18 15L15 18' stroke='currentColor' strokeWidth='1.25' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export function UserCircleFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 3.38708C7.02823 3.38708 3 7.41531 3 12.3871C3 17.3589 7.02823 21.3871 12 21.3871C16.9718 21.3871 21 17.3589 21 12.3871C21 7.41531 16.9718 3.38708 12 3.38708ZM12 6.87096C13.7637 6.87096 15.1935 8.30079 15.1935 10.0645C15.1935 11.8282 13.7637 13.2581 12 13.2581C10.2363 13.2581 8.80645 11.8282 8.80645 10.0645C8.80645 8.30079 10.2363 6.87096 12 6.87096ZM12 19.3548C9.86976 19.3548 7.96089 18.3895 6.68347 16.8798C7.36573 15.5951 8.70121 14.7097 10.2581 14.7097C10.3452 14.7097 10.4323 14.7242 10.5157 14.7496C10.9875 14.902 11.481 15 12 15C12.519 15 13.0161 14.902 13.4843 14.7496C13.5677 14.7242 13.6548 14.7097 13.7419 14.7097C15.2988 14.7097 16.6343 15.5951 17.3165 16.8798C16.0391 18.3895 14.1302 19.3548 12 19.3548Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function UserCirclePlusIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fill='currentColor'
        d='m7.488 17.675-.467.587.467-.587ZM12.25 20a.75.75 0 0 0 0-1.5V20Zm6.25-7.75a.75.75 0 0 0 1.5 0h-1.5Zm-6.25 4.25a.75.75 0 0 0 0-1.5v1.5Zm7 1.25a.75.75 0 0 0 0-1.5v1.5Zm-4.5-1.5a.75.75 0 0 0 0 1.5v-1.5Zm1.5 3a.75.75 0 0 0 1.5 0h-1.5Zm1.5-4.5a.75.75 0 0 0-1.5 0h1.5ZM5.5 12A6.5 6.5 0 0 1 12 5.5V4a8 8 0 0 0-8 8h1.5ZM12 5.5a6.5 6.5 0 0 1 6.5 6.5H20a8 8 0 0 0-8-8v1.5Zm1.5 5.5a1.5 1.5 0 0 1-1.5 1.5V14a3 3 0 0 0 3-3h-1.5ZM12 12.5a1.5 1.5 0 0 1-1.5-1.5H9a3 3 0 0 0 3 3v-1.5ZM10.5 11A1.5 1.5 0 0 1 12 9.5V8a3 3 0 0 0-3 3h1.5ZM12 9.5a1.5 1.5 0 0 1 1.5 1.5H15a3 3 0 0 0-3-3v1.5Zm-3.97 8.694A5.482 5.482 0 0 1 12 16.5V15a6.98 6.98 0 0 0-5.053 2.156l1.082 1.038ZM12 18.5a6.47 6.47 0 0 1-4.045-1.412l-.934 1.174A7.97 7.97 0 0 0 12 20v-1.5Zm-4.045-1.412A6.487 6.487 0 0 1 5.5 12H4a7.987 7.987 0 0 0 3.02 6.262l.935-1.174ZM12 20h.25v-1.5H12V20Zm6.5-8v.25H20V12h-1.5ZM12 16.5h.25V15H12v1.5Zm7.25-.25H17v1.5h2.25v-1.5Zm-2.25 0h-2.25v1.5H17v-1.5Zm.75 3V17h-1.5v2.25h1.5Zm0-2.25v-2.25h-1.5V17h1.5Z'
      ></path>
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle
        cx='12'
        cy='8'
        r='3.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M6.8475 19.25H17.1525C18.2944 19.25 19.174 18.2681 18.6408 17.2584C17.8563 15.7731 16.068 14 12 14C7.93201 14 6.14367 15.7731 5.35924 17.2584C4.82597 18.2681 5.70558 19.25 6.8475 19.25Z'
      ></path>
    </svg>
  )
}

export function SpeakerIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M15.75 10.7501C15.75 10.7501 16.25 11.2343 16.25 12C16.25 12.7657 15.75 13.2501 15.75 13.2501'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M17.75 7.74991C17.75 7.74991 19.25 8.99991 19.25 11.9987C19.25 14.9974 17.75 16.2499 17.75 16.2499'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M13.25 4.75L8.5 8.75H5.75C5.19772 8.75 4.75 9.19772 4.75 9.75V14.25C4.75 14.8023 5.19772 15.25 5.75 15.25H8.5L13.25 19.25V4.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}
export function SpeakerMuteIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M19.25 14.25L15.75 10.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M15.75 14.25L19.25 10.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M13.25 4.75L8.5 8.75H5.75C5.19772 8.75 4.75 9.19772 4.75 9.75V14.25C4.75 14.8023 5.19772 15.25 5.75 15.25H8.5L13.25 19.25V4.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function BuildingsIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M7.75 7.77502H9.25M7.75 10.775H9.25M14.75 13.775H16.25M14.75 10.775H16.25M12.25 19.2496V5.74963C12.25 5.19735 11.8023 4.74963 11.25 4.74963H5.75C5.19772 4.74963 4.75 5.19735 4.75 5.74963V18.2496C4.75 18.8019 5.19772 19.2496 5.75 19.2496H12.25ZM12.25 19.2496H18.25C18.8023 19.2496 19.25 18.8019 19.25 18.2496V8.74963C19.25 8.19735 18.8023 7.74963 18.25 7.74963H12.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function SpeechBubblePlusIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 18.25C15.866 18.25 19.25 16.1552 19.25 11.5C19.25 6.84483 15.866 4.75 12 4.75C8.13401 4.75 4.75 6.84483 4.75 11.5C4.75 13.2675 5.23783 14.6659 6.05464 15.7206C6.29358 16.0292 6.38851 16.4392 6.2231 16.7926C6.12235 17.0079 6.01633 17.2134 5.90792 17.4082C5.45369 18.2242 6.07951 19.4131 6.99526 19.2297C8.0113 19.0263 9.14752 18.722 10.0954 18.2738C10.2933 18.1803 10.5134 18.1439 10.7305 18.1714C11.145 18.224 11.5695 18.25 12 18.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M9.75 12H14.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12 9.75V14.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function SmartSummaryIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M9.25 6.75H6.75C6.21957 6.75 5.71086 6.96071 5.33579 7.33579C4.96071 7.71086 4.75 8.21957 4.75 8.75V15.25C4.75 15.7804 4.96071 16.2891 5.33579 16.6642C5.71086 17.0393 6.21957 17.25 6.75 17.25H17.25C17.7804 17.25 18.2891 17.0393 18.6642 16.6642C19.0393 16.2891 19.25 15.7804 19.25 15.25V12.75M12.75 8C12.75 8 16 8 16 4.75C16 8 19.25 8 19.25 8C19.25 8 16 8 16 11.25C16 8 12.75 8 12.75 8Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function LogOutIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.75 8.75L19.25 12L15.75 15.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M19 12H10.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H15.25'
      ></path>
    </svg>
  )
}

export function PicturePlusIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M11.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V16M4.75 16V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V12.25L16.5856 9.43947C15.7663 8.48581 14.2815 8.51598 13.5013 9.50017L13.4914 9.51294C13.3977 9.63414 11.9621 11.4909 10.9257 12.8094M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L10.9257 12.8094M10.9257 12.8094L12.25 14.25M10.9257 12.8094C10.9221 12.814 10.9186 12.8185 10.915 12.823'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M17 14.75V19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M19.25 17L14.75 17'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  const { size = 20, strokeWidth = '2', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M12 5.75V18.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M18.25 12L5.75 12'
      ></path>
    </svg>
  )
}

export function MinusIcon(props: IconProps) {
  const { size = 20, strokeWidth = 2, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M18.25 12.25L5.75 12.25'
      ></path>
    </svg>
  )
}

export function MinusUpIcon(props: IconProps) {
  const { size = 20, strokeWidth = 2, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M18.25 6.25H5.75'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function MinusDownIcon(props: IconProps) {
  const { size = 20, strokeWidth = 2, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M18.25 18.25H5.75'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
export function RefreshIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M11.25 14.75L8.75 17M8.75 17L11.25 19.25M8.75 17H13.25C16.5637 17 19.25 14.3137 19.25 11V10.75'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M15.25 7H10.75C7.43629 7 4.75 9.68629 4.75 13V13.25M15.25 7L12.75 9.25M15.25 7L12.75 4.75'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function RotateIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M17.1265 6.87348C14.2952 4.04217 9.70478 4.04217 6.87348 6.87348C4.04217 9.70478 4.04217 14.2952 6.87348 17.1265C9.70478 19.9578 14.2952 19.9578 17.1265 17.1265C17.7603 16.4927 18.2522 15.7708 18.6023 15.0001'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M19.25 19.25V15.75C19.25 15.1977 18.8023 14.75 18.25 14.75H14.75'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ButtonPlusIcon(props: IconProps) {
  const { size = 16, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M8 3.83337V12.1667'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12.1667 8H3.83334'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function PlusCircleIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M12 8.75003V15.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.25 12L8.75 12'
      ></path>
    </svg>
  )
}

export function MinusCircleIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.25 12L8.75 12'
      ></path>
    </svg>
  )
}

export function MinusCircleFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 4C7.58173 4 4 7.58173 4 12C4 16.4183 7.58173 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58173 16.4183 4 12 4ZM8.41331 11.25C7.99909 11.25 7.66331 11.5858 7.66331 12C7.66331 12.4142 7.99909 12.75 8.41331 12.75H15.5857C15.9999 12.75 16.3357 12.4142 16.3357 12C16.3357 11.5858 15.9999 11.25 15.5857 11.25H8.41331Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function PencilIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M4.75 19.25L9 18.25L18.9491 8.30083C19.3397 7.9103 19.3397 7.27714 18.9491 6.88661L17.1134 5.05083C16.7228 4.6603 16.0897 4.6603 15.6991 5.05083L5.75 15L4.75 19.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M14.0234 7.03906L17.0234 10.0391'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function LinkIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M16.75 13.25L18 12C19.6569 10.3431 19.6569 7.65685 18 6V6C16.3431 4.34315 13.6569 4.34315 12 6L10.75 7.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M7.25 10.75L6 12C4.34315 13.6569 4.34315 16.3431 6 18V18C7.65685 19.6569 10.3431 19.6569 12 18L13.25 16.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M14.25 9.75L9.75 14.25'
      ></path>
    </svg>
  )
}

export function AttachIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M19.4496 11.9511L13.3335 17.8601C11.4156 19.7131 8.30597 19.7131 6.38804 17.8601C4.46306 16.0003 4.47116 12.9826 6.4061 11.1325L12.0503 5.70078C13.3626 4.43293 15.4902 4.43292 16.8025 5.70075C18.1196 6.97324 18.114 9.038 16.7901 10.3039L11.0824 15.7858C10.374 16.4702 9.22538 16.4702 8.51694 15.7858C7.80849 15.1013 7.80849 13.9916 8.51695 13.3071L13.2435 8.74069'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function DownloadIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 14.75V16.25C4.75 17.9069 6.09315 19.25 7.75 19.25H16.25C17.9069 19.25 19.25 17.9069 19.25 16.25V14.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M12 14.25L12 4.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M8.75 10.75L12 14.25L15.25 10.75'
      ></path>
    </svg>
  )
}

export function DoubleChevronRightIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M7.75 8.75L11.25 12L7.75 15.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12.75 8.75L16.25 12L12.75 15.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function DoubleChevronLeftIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} {...rest} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M11.25 8.75L7.75 12L11.25 15.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M16.25 8.75L12.75 12L16.25 15.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M16.125 10L12.0625 14.375L8 10'
        stroke='currentColor'
        strokeWidth='1.875'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ChevronUpIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M16.125 14.375L12.0625 10L8 14.375'
        stroke='currentColor'
        strokeWidth='1.875'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M14.375 8L10 12.0625L14.375 16.125'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ChevronRightCircleIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10.4365 8.81079L13.9387 12.0628L10.4365 15.3148'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function BackUnreadIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M20 4C20 5.65684 18.6568 7 17 7C15.3432 7 14 5.65684 14 4C14 2.34316 15.3432 1 17 1C18.6568 1 20 2.34316 20 4Z'
        fill='#3B82F6'
      />
      <path
        d='M12.5 8.49995L9 11.9999L15.4615 17.9999'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function BackIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M15.4615 6L9 12L15.4615 18'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ChevronRightIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10 8L14.375 12.0625L10 16.125'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ChevronSelectIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M15.5 9.5L12.25 6L9 9.5'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M15.5 14L12.25 17.5L9 14'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ChevronSelectExpandIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M15.5 6L12.25 9.5L9 6'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M15.5 17.5L12.25 14L9 17.5'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function RSSIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M7.5 18C7.5 18.2761 7.27614 18.5 7 18.5C6.72386 18.5 6.5 18.2761 6.5 18C6.5 17.7239 6.72386 17.5 7 17.5C7.27614 17.5 7.5 17.7239 7.5 18Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
      />
      <path
        d='M6.75 11.75H7C10.4518 11.75 13.25 14.5482 13.25 18V18.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M6.75 5.75H7C13.7655 5.75 19.25 11.2345 19.25 18V18.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function TwitterIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M9.31 18.25C14.7819 18.25 17.7744 13.4403 17.7744 9.26994C17.7744 9.03682 17.9396 8.83015 18.152 8.73398C18.8803 8.40413 19.8249 7.49943 18.8494 5.97828C18.2031 6.32576 17.6719 6.51562 16.9603 6.74448C15.834 5.47393 13.9495 5.41269 12.7514 6.60761C11.9785 7.37819 11.651 8.52686 11.8907 9.62304C9.49851 9.49618 6.69788 7.73566 5.1875 5.76391C4.39814 7.20632 4.80107 9.05121 6.10822 9.97802C5.63461 9.96302 5.1716 9.82741 4.75807 9.58305V9.62304C4.75807 11.1255 5.75654 12.4191 7.1444 12.7166C6.70672 12.8435 6.24724 12.8622 5.80131 12.771C6.19128 14.0565 7.87974 15.4989 9.15272 15.5245C8.09887 16.4026 6.79761 16.8795 5.45806 16.8782C5.22126 16.8776 4.98504 16.8626 4.75 16.8326C6.11076 17.7588 7.69359 18.25 9.31 18.2475V18.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function XIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M18.3263 1.90393H21.6998L14.3297 10.3274L23 21.7899H16.2112L10.894 14.838L4.80995 21.7899H1.43443L9.31743 12.78L1 1.90393H7.96111L12.7674 8.25826L18.3263 1.90393ZM17.1423 19.7707H19.0116L6.94539 3.81706H4.93946L17.1423 19.7707Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function ThreadsIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M17.6921 11.1235C17.5887 11.074 17.4837 11.0263 17.3774 10.9806C17.1921 7.56728 15.327 5.61312 12.1952 5.59312C12.181 5.59304 12.1669 5.59304 12.1528 5.59304C10.2795 5.59304 8.72164 6.39261 7.76275 7.84759L9.48512 9.0291C10.2014 7.94229 11.3257 7.7106 12.1536 7.7106C12.1631 7.7106 12.1727 7.7106 12.1822 7.71069C13.2134 7.71726 13.9915 8.01708 14.4951 8.60175C14.8616 9.02741 15.1067 9.61563 15.2281 10.358C14.3139 10.2026 13.3251 10.1548 12.2681 10.2154C9.29059 10.3869 7.37639 12.1235 7.50495 14.5365C7.57019 15.7605 8.17996 16.8135 9.22188 17.5014C10.1028 18.0829 11.2374 18.3673 12.4165 18.3029C13.9738 18.2175 15.1954 17.6234 16.0476 16.537C16.6949 15.712 17.1042 14.6429 17.285 13.2957C18.0271 13.7436 18.5771 14.333 18.8809 15.0415C19.3974 16.2459 19.4275 18.225 17.8126 19.8385C16.3978 21.252 14.697 21.8635 12.1267 21.8824C9.27552 21.8612 7.11922 20.9469 5.71726 19.1646C4.40444 17.4958 3.72596 15.0852 3.70065 12C3.72596 8.91473 4.40444 6.5042 5.71726 4.83534C7.11922 3.05311 9.27549 2.13875 12.1266 2.11756C14.9985 2.13891 17.1924 3.05767 18.648 4.8485C19.3618 5.7267 19.8999 6.8311 20.2546 8.11879L22.273 7.58028C21.843 5.99528 21.1664 4.62946 20.2456 3.49675C18.3795 1.20084 15.6503 0.0243935 12.1337 0H12.1196C8.6102 0.0243088 5.91151 1.20522 4.09854 3.50991C2.48524 5.5608 1.65305 8.41446 1.62509 11.9916L1.625 12L1.62509 12.0084C1.65305 15.5855 2.48524 18.4393 4.09854 20.4901C5.91151 22.7948 8.6102 23.9757 12.1196 24H12.1337C15.2538 23.9784 17.453 23.1615 19.2647 21.3514C21.6351 18.9832 21.5637 16.0149 20.7825 14.1926C20.222 12.8859 19.1534 11.8245 17.6921 11.1235ZM12.3051 16.1884C11.0001 16.2619 9.6443 15.6761 9.57745 14.4215C9.5279 13.4913 10.2395 12.4532 12.3851 12.3296C12.6309 12.3154 12.872 12.3085 13.1089 12.3085C13.8883 12.3085 14.6174 12.3842 15.2802 12.5291C15.033 15.6169 13.5828 16.1182 12.3051 16.1884Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function LinkedInIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <g clipPath='url(#clip0_5338_376)'>
        <path
          d='M22.2283 0H1.77167C1.30179 0 0.851161 0.186657 0.518909 0.518909C0.186657 0.851161 0 1.30179 0 1.77167V22.2283C0 22.6982 0.186657 23.1488 0.518909 23.4811C0.851161 23.8133 1.30179 24 1.77167 24H22.2283C22.6982 24 23.1488 23.8133 23.4811 23.4811C23.8133 23.1488 24 22.6982 24 22.2283V1.77167C24 1.30179 23.8133 0.851161 23.4811 0.518909C23.1488 0.186657 22.6982 0 22.2283 0ZM7.15333 20.445H3.545V8.98333H7.15333V20.445ZM5.34667 7.395C4.93736 7.3927 4.53792 7.2692 4.19873 7.04009C3.85955 6.81098 3.59584 6.48653 3.44088 6.10769C3.28591 5.72885 3.24665 5.31259 3.32803 4.91145C3.40941 4.51032 3.6078 4.14228 3.89816 3.85378C4.18851 3.56529 4.55782 3.36927 4.95947 3.29046C5.36112 3.21165 5.77711 3.25359 6.15495 3.41099C6.53279 3.56838 6.85554 3.83417 7.08247 4.17481C7.30939 4.51546 7.43032 4.91569 7.43 5.325C7.43386 5.59903 7.38251 5.87104 7.27901 6.1248C7.17551 6.37857 7.02198 6.6089 6.82757 6.80207C6.63316 6.99523 6.40185 7.14728 6.14742 7.24915C5.893 7.35102 5.62067 7.40062 5.34667 7.395ZM20.4533 20.455H16.8467V14.1933C16.8467 12.3467 16.0617 11.7767 15.0483 11.7767C13.9783 11.7767 12.9283 12.5833 12.9283 14.24V20.455H9.32V8.99167H12.79V10.58H12.8367C13.185 9.875 14.405 8.67 16.2667 8.67C18.28 8.67 20.455 9.865 20.455 13.365L20.4533 20.455Z'
          fill='currentColor'
        />
      </g>
      <defs>
        <clipPath id='clip0_5338_376'>
          <rect width='24' height='24' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export function ShipIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M4.75 17.75C4.75 17.75 7.5 20.9296 12 18C16.5 15.0703 19.25 18.25 19.25 18.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M17.75 14.25L19 11.75H5L6.65625 15.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12.25 11.5V4.75L7 11.5'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ShipUnreadIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M4.75 17.7501C4.75 17.7501 7.5 20.9297 12 18.0001C16.5 15.0704 19.25 18.2501 19.25 18.2501'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M17.75 14.25L19 11.75H5L6.65625 15.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12.25 11.5V4.75L7 11.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M22 5C22 6.65684 20.6568 8 19 8C17.3432 8 16 6.65684 16 5C16 3.34316 17.3432 2 19 2C20.6568 2 22 3.34316 22 5Z'
        fill='#FF591E'
        stroke='#FF591E'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function GitCommitIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M16.25 12C16.25 14.3472 14.3472 16.25 12 16.25C9.65279 16.25 7.75 14.3472 7.75 12C7.75 9.65279 9.65279 7.75 12 7.75C14.3472 7.75 16.25 9.65279 16.25 12Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 12H7.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M16.5 12H19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ScrollIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M9.75 8.75H13.25M9.75 11.75H13.25M17.625 4.75C16.7275 4.75 16.25 5.75736 16.25 7V7.25M17.625 4.75C18.5225 4.75 19.25 5.75736 19.25 7V7.25H16.25M17.625 4.75H8.75C7.64543 4.75 6.75 5.64543 6.75 6.75V16.75M16.25 7.25V17C16.25 18.2426 15.2725 19.25 14.375 19.25M14.375 19.25C13.4775 19.25 12.75 18.2426 12.75 17V16.75H6.75M14.375 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V16.75H6.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M19.25 19.25L15.5 15.5M4.75 11C4.75 7.54822 7.54822 4.75 11 4.75C14.4518 4.75 17.25 7.54822 17.25 11C17.25 14.4518 14.4518 17.25 11 17.25C7.54822 17.25 4.75 14.4518 4.75 11Z'
      ></path>
    </svg>
  )
}

export function ZoomInIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <circle
        cx='11'
        cy='11'
        r='6.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.5 15.5L19.25 19.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M11 8.75V13.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M13.25 11L8.75 11'
      ></path>
    </svg>
  )
}

export function InformationIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path d='M12 13V15' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />

      <path
        d='M12 10C12.5523 10 13 9.55228 13 9C13 8.44772 12.5523 8 12 8C11.4477 8 11 8.44772 11 9C11 9.55228 11.4477 10 12 10Z'
        fill='currentColor'
      />

      <path
        d='M12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function PaperAirplaneIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M19.0002 5L10.2002 13.8'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19 5L13.4 21L10.2 13.8L3 10.6L19 5Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function PaperAirplaneFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.5618 21C12.2054 21 11.9483 20.8727 11.7905 20.6181C11.6326 20.3636 11.4977 20.0453 11.3857 19.6635L10.1714 15.631C10.1001 15.3765 10.0746 15.1728 10.095 15.02C10.1154 14.8622 10.1994 14.7044 10.347 14.5465L18.1446 6.13795C18.1905 6.09212 18.2134 6.04121 18.2134 5.9852C18.2134 5.9292 18.193 5.88337 18.1523 5.84773C18.1115 5.81209 18.0632 5.79427 18.0072 5.79427C17.9562 5.78918 17.9079 5.80955 17.8621 5.85537L9.48401 13.6835C9.31599 13.8363 9.15306 13.9228 8.99523 13.9432C8.83739 13.9585 8.63628 13.9279 8.39189 13.8516L4.26778 12.599C3.90119 12.487 3.59825 12.3547 3.35895 12.2019C3.11965 12.0441 3 11.7895 3 11.4382C3 11.1632 3.10947 10.9265 3.3284 10.7279C3.54733 10.5294 3.81718 10.369 4.13795 10.2468L17.274 5.21384C17.4522 5.14765 17.6177 5.09674 17.7704 5.0611C17.9282 5.02037 18.0708 5 18.1981 5C18.4476 5 18.6436 5.07128 18.7862 5.21384C18.9287 5.3564 19 5.55243 19 5.80191C19 5.93429 18.9796 6.07685 18.9389 6.22959C18.9033 6.38234 18.8523 6.54781 18.7862 6.72601L13.7838 19.7933C13.6412 20.1599 13.4706 20.4527 13.2721 20.6716C13.0735 20.8905 12.8368 21 12.5618 21Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function PaperclipIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M19.4496 11.9511L13.3335 17.8601C11.4156 19.7131 8.30597 19.7131 6.38804 17.8601C4.46306 16.0003 4.47116 12.9826 6.4061 11.1325L12.0503 5.70078C13.3626 4.43293 15.4902 4.43292 16.8025 5.70075C18.1196 6.97324 18.114 9.038 16.7901 10.3039L11.0824 15.7858C10.374 16.4702 9.22538 16.4702 8.51694 15.7858C7.80849 15.1013 7.80849 13.9916 8.51695 13.3071L13.2435 8.74069'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function QuestionMarkIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M8.249 7a4.25 4.25 0 1 1 5.678 5.789C12.943 13.29 12 14.145 12 15.25M12 19v.25'
      ></path>
    </svg>
  )
}

export function QuestionMarkCircleIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10.5 9.49808C10.6424 9.21077 10.8622 8.96897 11.1347 8.8C11.4072 8.63103 11.7216 8.54162 12.0422 8.54186C12.3837 8.54184 12.7176 8.64343 13.0012 8.83371C13.2848 9.02399 13.5054 9.29434 13.6349 9.61038C13.7645 9.92641 13.797 10.2738 13.7285 10.6084C13.66 10.943 13.4934 11.2497 13.2501 11.4893C12.8676 11.8665 12.4025 12.2734 12.1776 12.7516M12.0422 15.0442V15.0519M12 19.25C11.0479 19.25 10.1052 19.0625 9.22554 18.6981C8.34593 18.3338 7.5467 17.7997 6.87348 17.1265C6.20025 16.4533 5.66622 15.6541 5.30187 14.7745C4.93753 13.8948 4.75 12.9521 4.75 12C4.75 11.0479 4.93753 10.1052 5.30187 9.22554C5.66622 8.34593 6.20025 7.5467 6.87348 6.87348C7.5467 6.20025 8.34593 5.66622 9.22554 5.30187C10.1052 4.93753 11.0479 4.75 12 4.75C13.9228 4.75 15.7669 5.51384 17.1265 6.87348C18.4862 8.23311 19.25 10.0772 19.25 12C19.25 13.9228 18.4862 15.7669 17.1265 17.1265C15.7669 18.4862 13.9228 19.25 12 19.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function CreditCardIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M4.75 7.75C4.75 6.64543 5.64543 5.75 6.75 5.75H17.25C18.3546 5.75 19.25 6.64543 19.25 7.75V16.25C19.25 17.3546 18.3546 18.25 17.25 18.25H6.75C5.64543 18.25 4.75 17.3546 4.75 16.25V7.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path d='M5 10.25H19' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
      <path
        d='M7.75 14.25H10.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M15.75 14.25H16.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function PostIcon(props: IconProps) {
  const { size = 20, strokeWidth = 1.5, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M17.2502 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.2502C18.3548 4.75 19.2502 5.64543 19.2502 6.75V17.25C19.2502 18.3546 18.3548 19.25 17.2502 19.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M8 12.5H16' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' />
      <path d='M8 16H14' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' />
    </svg>
  )
}

export function PostDraftIcon(props: IconProps) {
  const { size = 20, strokeWidth = 1.5, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M6.75 19.25C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.2502C18.3548 4.75 19.2502 5.64543 19.2502 6.75'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M8 13H12' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' />
      <path d='M8 16H9.5' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' />
      <path
        d='M11.185 19.2138C11.0999 19.5753 11.4247 19.9001 11.7862 19.815L13.7955 19.3422C13.886 19.3209 13.9688 19.2748 14.0345 19.2091L20.5353 12.7083C21.1549 12.0887 21.1549 11.0842 20.5353 10.4647C19.9158 9.84511 18.9113 9.84511 18.2917 10.4647L11.7909 16.9655C11.7252 17.0312 11.6791 17.114 11.6578 17.2045L11.185 19.2138Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function PostFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6.20687 19.9999H17.7931C19.012 19.9999 20 19.0119 20 17.793V6.20699C20 4.98817 19.012 4.00012 17.7931 4.00012H6.20687C4.98805 4.00012 4 4.98817 4 6.20699V17.793C4 19.0119 4.98805 19.9999 6.20687 19.9999ZM8.13798 9.79313C9.05209 9.79313 9.79313 9.05209 9.79313 8.13798C9.79313 7.22388 9.05209 6.48283 8.13798 6.48283C7.22388 6.48283 6.48283 7.22388 6.48283 8.13798C6.48283 9.05209 7.22388 9.79313 8.13798 9.79313ZM6.75869 12.5517C6.75869 12.0947 7.12921 11.7241 7.58627 11.7241H16.4137C16.8708 11.7241 17.2413 12.0947 17.2413 12.5517C17.2413 13.0088 16.8708 13.3793 16.4137 13.3793H7.58627C7.12921 13.3793 6.75869 13.0088 6.75869 12.5517ZM7.58627 15.5862C7.12921 15.5862 6.75869 15.9567 6.75869 16.4137C6.75869 16.8708 7.12921 17.2413 7.58627 17.2413H14.2069C14.6639 17.2413 15.0344 16.8708 15.0344 16.4137C15.0344 15.9567 14.6639 15.5862 14.2069 15.5862H7.58627Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function PencilFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 20 20' {...rest}>
      <path
        d='M3.95898 16.0416L7.50065 15.2082L15.7916 6.91726C16.1171 6.59182 16.1171 6.06418 15.7916 5.73874L14.2618 4.20892C13.9363 3.88348 13.4087 3.88348 13.0832 4.20892L4.79232 12.4999L3.95898 16.0416Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M11.6855 5.86523L14.1855 8.36527'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ResolveCommentIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M9.28968 5.13354C6.67981 5.92925 4.75 7.98457 4.75 11.5C4.75 13.2675 5.23783 14.6659 6.05464 15.7206C6.29358 16.0292 6.38851 16.4392 6.2231 16.7926C6.12235 17.0079 6.01633 17.2134 5.90792 17.4082C5.45369 18.2242 6.07951 19.4131 6.99526 19.2297C8.0113 19.0263 9.14752 18.722 10.0954 18.2738C10.2933 18.1803 10.5134 18.1439 10.7305 18.1714C11.145 18.224 11.5695 18.25 12 18.25C14.6652 18.25 17.1013 17.2544 18.3575 15.1107'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M17 2C14.2386 2 12 4.23858 12 7C12 9.76145 14.2386 12 17 12C19.7614 12 22 9.76145 22 7C22 4.23858 19.7614 2 17 2ZM19.357 6.24328C19.5432 6.06335 19.5482 5.76659 19.3683 5.58046C19.1883 5.39432 18.8916 5.38929 18.7055 5.56922L16.4544 7.74526L15.6164 6.8881C15.4355 6.70297 15.1387 6.69961 14.9536 6.88058C14.7685 7.06155 14.7651 7.35833 14.9461 7.54345L16.1099 8.73393C16.2901 8.91831 16.5854 8.92249 16.7708 8.74328L19.357 6.24328Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function UnresolveCommentIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M10.0954 4.93176C7.08694 5.53116 4.75 7.63154 4.75 11.5001C4.75 13.2676 5.23783 14.666 6.05464 15.7207C6.29358 16.0293 6.38851 16.4393 6.2231 16.7927C6.12235 17.008 6.01633 17.2135 5.90792 17.4083C5.45369 18.2243 6.07951 19.4132 6.99526 19.2298C8.0113 19.0264 9.14752 18.7221 10.0954 18.2739C10.2933 18.1804 10.5134 18.144 10.7305 18.1715C11.145 18.2241 11.5695 18.2501 12 18.2501C15.3056 18.2501 18.2588 16.7186 19.0455 13.3645'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M16.1905 8.88235L15 9.94118M15 9.94118L16.1905 11M15 9.94118H17.1429C18.7208 9.94118 20 8.67704 20 7.11765V7'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M18 5.05882H15.8571C14.2792 5.05882 13 6.32296 13 7.88235V8M18 5.05882L16.8095 6.11765M18 5.05882L16.8095 4'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function PostPlusIcon(props: IconProps) {
  const { size = 20, strokeWidth = 1.5, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M13.5 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.2502C18.3548 19.25 19.2502 18.3546 19.2502 17.25C19.2502 17.25 19.2502 14.4171 19.2502 11M19.125 3V5.125M19.125 5.125V7.25M19.125 5.125H17M19.125 5.125H21.25'
        stroke={'currentColor'}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5Z'
        fill={'currentColor'}
        stroke={'currentColor'}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M8 12.5H16' stroke={'currentColor'} strokeWidth={strokeWidth} strokeLinecap='round' />
      <path d='M8 16H14' stroke={'currentColor'} strokeWidth={strokeWidth} strokeLinecap='round' />
    </svg>
  )
}

export function FileIcon(props: IconProps) {
  const { size = 20, strokeWidth = 1.5, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M7.75 19.25H16.25C17.3546 19.25 18.25 18.3546 18.25 17.25V9L14 4.75H7.75C6.64543 4.75 5.75 5.64543 5.75 6.75V17.25C5.75 18.3546 6.64543 19.25 7.75 19.25Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M18 9.25H13.75V5'
      ></path>
    </svg>
  )
}

export function FileCodeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.75 4.75H7.75C7.21957 4.75 6.71086 4.96071 6.33579 5.33579C5.96071 5.71086 5.75 6.21957 5.75 6.75V17.25C5.75 17.7804 5.96071 18.2891 6.33579 18.6642C6.71086 19.0393 7.21957 19.25 7.75 19.25H8.25M12.75 4.75V8.25C12.75 8.78043 12.9607 9.28914 13.3358 9.66421C13.7109 10.0393 14.2196 10.25 14.75 10.25H18.25M12.75 4.75L18.25 10.25M18.25 10.25V12.25M13.25 14.75L10.75 17L13.25 19.25M16.75 14.75L19.25 17L16.75 19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function FilePdfIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.75 4.75H7.75C7.21957 4.75 6.71086 4.96071 6.33579 5.33579C5.96071 5.71086 5.75 6.21957 5.75 6.75L5.75005 12.5M12.75 4.75V8.25C12.75 8.78043 12.9607 9.28914 13.3358 9.66421C13.7109 10.0393 14.2196 10.25 14.75 10.25H18.25M12.75 4.75L18.25 10.25M18.25 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#EF4444' />
      <path
        d='M6.40172 15.2725H8.05699C9.00035 15.2725 9.58043 15.8438 9.58043 16.7725C9.58043 17.6895 8.97105 18.2607 7.99254 18.2607H7.47691V19.5H6.40172V15.2725ZM7.47691 16.0898V17.4434H7.78453C8.27672 17.4434 8.49352 17.2354 8.49352 16.7666C8.49352 16.2979 8.27672 16.0898 7.78453 16.0898H7.47691ZM10.4121 15.2725H11.9004C13.0752 15.2725 13.7021 15.9932 13.7021 17.3438C13.7021 18.7646 13.0869 19.5 11.9004 19.5H10.4121V15.2725ZM11.4873 16.1367V18.6357H11.7363C12.3428 18.6357 12.6064 18.249 12.6064 17.3643C12.6064 16.5352 12.3252 16.1367 11.7363 16.1367H11.4873ZM15.8346 19.5H14.7594V15.2725H17.5661V16.1367H15.8346V17.1006H17.3991V17.9238H15.8346V19.5Z'
        fill='white'
      />
    </svg>
  )
}

export function FileAiIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.75 4.75H7.75C7.21957 4.75 6.71086 4.96071 6.33579 5.33579C5.96071 5.71086 5.75 6.21957 5.75 6.75L5.75005 12.5M12.75 4.75V8.25C12.75 8.78043 12.9607 9.28914 13.3358 9.66421C13.7109 10.0393 14.2196 10.25 14.75 10.25H18.25M12.75 4.75L18.25 10.25M18.25 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#FB923C' />
      <path
        d='M10.6481 19.5L10.4518 18.5713H9.37957L9.17742 19.5H8.11102L9.30633 15.2725H10.6218L11.82 19.5H10.6481ZM9.8952 16.2246L9.54949 17.7979H10.2848L9.95086 16.2246H9.8952ZM15.4613 19.5H12.6077V18.6357H13.4984V16.1367H12.6077V15.2725H15.4613V16.1367H14.5706V18.6357H15.4613V19.5Z'
        fill='white'
      />
    </svg>
  )
}

export function FilePsdIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.75 4.75H7.75C7.21957 4.75 6.71086 4.96071 6.33579 5.33579C5.96071 5.71086 5.75 6.21957 5.75 6.75L5.75005 12.5M12.75 4.75V8.25C12.75 8.78043 12.9607 9.28914 13.3358 9.66421C13.7109 10.0393 14.2196 10.25 14.75 10.25H18.25M12.75 4.75L18.25 10.25M18.25 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#1E40AF' />
      <path
        d='M6.40172 15.2725H8.05699C9.00035 15.2725 9.58043 15.8438 9.58043 16.7725C9.58043 17.6895 8.97105 18.2607 7.99254 18.2607H7.47691V19.5H6.40172V15.2725ZM7.47691 16.0898V17.4434H7.78453C8.27672 17.4434 8.49352 17.2354 8.49352 16.7666C8.49352 16.2979 8.27672 16.0898 7.78453 16.0898H7.47691ZM10.3271 18.2812H11.3262C11.3525 18.5918 11.5928 18.7588 12.0146 18.7588C12.3896 18.7588 12.6211 18.5859 12.6211 18.3047C12.6211 18.0674 12.4775 17.9561 12.0527 17.8652L11.5518 17.7568C10.8018 17.5957 10.4121 17.1768 10.4121 16.541C10.4121 15.7119 11.0244 15.1875 11.9971 15.1875C12.9434 15.1875 13.5791 15.7061 13.5938 16.4912H12.5947C12.5771 16.1953 12.3545 16.0107 12.0088 16.0107C11.6807 16.0107 11.4727 16.1689 11.4727 16.418C11.4727 16.6758 11.625 16.8105 12.0088 16.8896L12.4922 16.9922C13.3066 17.1621 13.6729 17.5342 13.6729 18.1846C13.6729 19.0693 13.0547 19.585 11.9912 19.585C10.9658 19.585 10.3447 19.0986 10.3271 18.2812ZM14.4811 15.2725H15.9694C17.1442 15.2725 17.7711 15.9932 17.7711 17.3438C17.7711 18.7646 17.1559 19.5 15.9694 19.5H14.4811V15.2725ZM15.5563 16.1367V18.6357H15.8053C16.4118 18.6357 16.6754 18.249 16.6754 17.3643C16.6754 16.5352 16.3942 16.1367 15.8053 16.1367H15.5563Z'
        fill='white'
      />
    </svg>
  )
}

export function FileEpsIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.75 4.75H7.75C7.21957 4.75 6.71086 4.96071 6.33579 5.33579C5.96071 5.71086 5.75 6.21957 5.75 6.75L5.75005 12.5M12.75 4.75V8.25C12.75 8.78043 12.9607 9.28914 13.3358 9.66421C13.7109 10.0393 14.2196 10.25 14.75 10.25H18.25M12.75 4.75L18.25 10.25M18.25 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#FBBF24' />
      <path
        d='M9.38121 18.6357V19.5H6.58629V15.2725H9.38121V16.1367H7.66148V16.9805H9.27281V17.7715H7.66148V18.6357H9.38121ZM10.4707 15.2725H12.126C13.0693 15.2725 13.6494 15.8438 13.6494 16.7725C13.6494 17.6895 13.04 18.2607 12.0615 18.2607H11.5459V19.5H10.4707V15.2725ZM11.5459 16.0898V17.4434H11.8535C12.3457 17.4434 12.5625 17.2354 12.5625 16.7666C12.5625 16.2979 12.3457 16.0898 11.8535 16.0898H11.5459ZM14.3961 18.2812H15.3952C15.4215 18.5918 15.6618 18.7588 16.0836 18.7588C16.4586 18.7588 16.6901 18.5859 16.6901 18.3047C16.6901 18.0674 16.5465 17.9561 16.1217 17.8652L15.6207 17.7568C14.8707 17.5957 14.4811 17.1768 14.4811 16.541C14.4811 15.7119 15.0934 15.1875 16.0661 15.1875C17.0123 15.1875 17.6481 15.7061 17.6627 16.4912H16.6637C16.6461 16.1953 16.4235 16.0107 16.0778 16.0107C15.7496 16.0107 15.5416 16.1689 15.5416 16.418C15.5416 16.6758 15.694 16.8105 16.0778 16.8896L16.5612 16.9922C17.3756 17.1621 17.7418 17.5342 17.7418 18.1846C17.7418 19.0693 17.1237 19.585 16.0602 19.585C15.0348 19.585 14.4137 19.0986 14.3961 18.2812Z'
        fill='white'
      />
    </svg>
  )
}

export function FileWavIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#4F46E5' />
      <path
        d='M7.95738 17.0859H7.90465L7.59703 19.5H6.68004L6.07652 15.2725H7.03746L7.14293 16.5908L7.23961 18.208H7.2982L7.53844 16.2393H8.32359L8.56383 18.208H8.62242L8.7191 16.5908L8.82457 15.2725H9.78551L9.18199 19.5H8.265L7.95738 17.0859ZM12.6826 19.5L12.4863 18.5713H11.4141L11.2119 19.5H10.1455L11.3408 15.2725H12.6562L13.8545 19.5H12.6826ZM11.9297 16.2246L11.584 17.7979H12.3193L11.9854 16.2246H11.9297ZM16.1393 18.5479L16.8571 15.2725H17.9235L16.7282 19.5H15.4127L14.2145 15.2725H15.3864L16.0836 18.5479H16.1393Z'
        fill='white'
      />
    </svg>
  )
}

export function FileMp3Icon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#FC7529' />
      <path
        d='M7.18102 18.2402V19.5H6.30211V15.2725H7.38902L7.90172 17.5723H7.96031L8.47301 15.2725H9.55992V19.5H8.68102V18.2402L8.84508 16.5674H8.76598L8.27379 18.5068H7.58824L7.09605 16.5674H7.01695L7.18102 18.2402ZM10.4707 15.2725H12.126C13.0693 15.2725 13.6494 15.8438 13.6494 16.7725C13.6494 17.6895 13.04 18.2607 12.0615 18.2607H11.5459V19.5H10.4707V15.2725ZM11.5459 16.0898V17.4434H11.8535C12.3457 17.4434 12.5625 17.2354 12.5625 16.7666C12.5625 16.2979 12.3457 16.0898 11.8535 16.0898H11.5459ZM15.5534 17.71V16.9688H16.0748C16.4557 16.9688 16.6871 16.7842 16.6871 16.4795C16.6871 16.1748 16.4557 15.9902 16.0748 15.9902C15.6998 15.9902 15.4508 16.2012 15.4391 16.5264H14.5045C14.5192 15.6943 15.1256 15.1875 16.1041 15.1875C17.0387 15.1875 17.6569 15.6416 17.6569 16.3271C17.6569 16.8164 17.358 17.1855 16.8864 17.2705V17.3262C17.4664 17.3877 17.8121 17.7539 17.8121 18.3018C17.8121 19.0723 17.1295 19.585 16.1041 19.585C15.1139 19.585 14.4635 19.0605 14.4254 18.2314H15.4098C15.4245 18.5391 15.6764 18.7295 16.0748 18.7295C16.4821 18.7295 16.7487 18.5273 16.7487 18.2197C16.7487 17.9121 16.4821 17.71 16.0748 17.71H15.5534Z'
        fill='white'
      />
    </svg>
  )
}

export function FileCsvIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#64748B' />
      <path
        d='M8.02184 18.6855C8.36168 18.6855 8.57262 18.3984 8.57262 17.9355H9.66539C9.66539 18.9785 9.0648 19.585 8.0277 19.585C6.94078 19.585 6.29625 18.9404 6.29625 17.8535V16.9189C6.29625 15.832 6.94078 15.1875 8.0277 15.1875C9.0648 15.1875 9.65953 15.7939 9.65953 16.8545H8.56676C8.56676 16.3828 8.34996 16.0869 8.00426 16.0869C7.62047 16.0869 7.41832 16.374 7.41832 16.9189V17.8535C7.41832 18.4014 7.6234 18.6855 8.02184 18.6855ZM10.3271 18.2812H11.3262C11.3525 18.5918 11.5928 18.7588 12.0146 18.7588C12.3896 18.7588 12.6211 18.5859 12.6211 18.3047C12.6211 18.0674 12.4775 17.9561 12.0527 17.8652L11.5518 17.7568C10.8018 17.5957 10.4121 17.1768 10.4121 16.541C10.4121 15.7119 11.0244 15.1875 11.9971 15.1875C12.9434 15.1875 13.5791 15.7061 13.5938 16.4912H12.5947C12.5771 16.1953 12.3545 16.0107 12.0088 16.0107C11.6807 16.0107 11.4727 16.1689 11.4727 16.418C11.4727 16.6758 11.625 16.8105 12.0088 16.8896L12.4922 16.9922C13.3066 17.1621 13.6729 17.5342 13.6729 18.1846C13.6729 19.0693 13.0547 19.585 11.9912 19.585C10.9658 19.585 10.3447 19.0986 10.3271 18.2812ZM16.1393 18.5479L16.8571 15.2725H17.9235L16.7282 19.5H15.4127L14.2145 15.2725H15.3864L16.0836 18.5479H16.1393Z'
        fill='white'
      />
    </svg>
  )
}

export function FileDwgIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#2563EB' />
      <path
        d='M6.34312 15.2725H7.83141C9.00621 15.2725 9.63316 15.9932 9.63316 17.3438C9.63316 18.7646 9.01793 19.5 7.83141 19.5H6.34312V15.2725ZM7.41832 16.1367V18.6357H7.66734C8.27379 18.6357 8.53746 18.249 8.53746 17.3643C8.53746 16.5352 8.25621 16.1367 7.66734 16.1367H7.41832ZM12.0264 17.0859H11.9736L11.666 19.5H10.749L10.1455 15.2725H11.1064L11.2119 16.5908L11.3086 18.208H11.3672L11.6074 16.2393H12.3926L12.6328 18.208H12.6914L12.7881 16.5908L12.8936 15.2725H13.8545L13.251 19.5H12.334L12.0264 17.0859ZM16.6813 18.0615V17.9326H16.0368V17.1943H17.7741V18.0615C17.7741 18.9961 17.1442 19.585 16.151 19.585C15.07 19.585 14.4342 18.9463 14.4342 17.8535V16.9189C14.4342 15.8262 15.07 15.1875 16.151 15.1875C17.1295 15.1875 17.7448 15.7646 17.7682 16.7109H16.6754C16.6549 16.3301 16.4352 16.0869 16.1159 16.0869C15.7262 16.0869 15.527 16.3682 15.527 16.9189V17.8535C15.527 18.4072 15.7291 18.6855 16.1334 18.6855C16.4791 18.6855 16.6813 18.457 16.6813 18.0615Z'
        fill='white'
      />
    </svg>
  )
}

export function FileTxtIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='currentColor' />
      <path
        d='M8.46715 19.5H7.39488V16.1367H6.23473V15.2725H9.6273V16.1367H8.46715V19.5ZM10.1455 19.5L11.332 17.3672L10.1455 15.2725H11.3115L12 16.6729H12.0527L12.7412 15.2725H13.8545L12.6182 17.3789L13.8545 19.5H12.7295L11.9912 18.1611H11.9414L11.209 19.5H10.1455ZM16.6051 19.5H15.5329V16.1367H14.3727V15.2725H17.7653V16.1367H16.6051V19.5Z'
        fill='white'
      />
    </svg>
  )
}

export function FileDmgIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='currentColor' />
      <path
        d='M6.34312 15.2725H7.83141C9.00621 15.2725 9.63316 15.9932 9.63316 17.3438C9.63316 18.7646 9.01793 19.5 7.83141 19.5H6.34312V15.2725ZM7.41832 16.1367V18.6357H7.66734C8.27379 18.6357 8.53746 18.249 8.53746 17.3643C8.53746 16.5352 8.25621 16.1367 7.66734 16.1367H7.41832ZM11.25 18.2402V19.5H10.3711V15.2725H11.458L11.9707 17.5723H12.0293L12.542 15.2725H13.6289V19.5H12.75V18.2402L12.9141 16.5674H12.835L12.3428 18.5068H11.6572L11.165 16.5674H11.0859L11.25 18.2402ZM16.6813 18.0615V17.9326H16.0368V17.1943H17.7741V18.0615C17.7741 18.9961 17.1442 19.585 16.151 19.585C15.07 19.585 14.4342 18.9463 14.4342 17.8535V16.9189C14.4342 15.8262 15.07 15.1875 16.151 15.1875C17.1295 15.1875 17.7448 15.7646 17.7682 16.7109H16.6754C16.6549 16.3301 16.4352 16.0869 16.1159 16.0869C15.7262 16.0869 15.527 16.3682 15.527 16.9189V17.8535C15.527 18.4072 15.7291 18.6855 16.1334 18.6855C16.4791 18.6855 16.6813 18.457 16.6813 18.0615Z'
        fill='white'
      />
    </svg>
  )
}

export function FileExeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='currentColor' />
      <path
        d='M9.38121 18.6357V19.5H6.58629V15.2725H9.38121V16.1367H7.66148V16.9805H9.27281V17.7715H7.66148V18.6357H9.38121ZM10.1455 19.5L11.332 17.3672L10.1455 15.2725H11.3115L12 16.6729H12.0527L12.7412 15.2725H13.8545L12.6182 17.3789L13.8545 19.5H12.7295L11.9912 18.1611H11.9414L11.209 19.5H10.1455ZM17.5192 18.6357V19.5H14.7243V15.2725H17.5192V16.1367H15.7995V16.9805H17.4108V17.7715H15.7995V18.6357H17.5192Z'
        fill='white'
      />
    </svg>
  )
}

export function FileMkvIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#2DD4BF' />
      <path
        d='M7.18102 18.2402V19.5H6.30211V15.2725H7.38902L7.90172 17.5723H7.96031L8.47301 15.2725H9.55992V19.5H8.68102V18.2402L8.84508 16.5674H8.76598L8.27379 18.5068H7.58824L7.09605 16.5674H7.01695L7.18102 18.2402ZM11.4844 19.5H10.4795V15.2725H11.4844V17.0889H11.5371L12.8379 15.2725H13.9277L12.5537 17.1387L13.9775 19.5H12.7559L11.8066 17.8564L11.4844 18.3047V19.5ZM16.1393 18.5479L16.8571 15.2725H17.9235L16.7282 19.5H15.4127L14.2145 15.2725H15.3864L16.0836 18.5479H16.1393Z'
        fill='white'
      />
    </svg>
  )
}

export function FileAviIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#38BDF8' />
      <path
        d='M8.61363 19.5L8.41734 18.5713H7.34508L7.14293 19.5H6.07652L7.27184 15.2725H8.58727L9.78551 19.5H8.61363ZM7.8607 16.2246L7.515 17.7979H8.25035L7.91637 16.2246H7.8607ZM12.0703 18.5479L12.7881 15.2725H13.8545L12.6592 19.5H11.3438L10.1455 15.2725H11.3174L12.0146 18.5479H12.0703ZM17.4957 19.5H14.6422V18.6357H15.5329V16.1367H14.6422V15.2725H17.4957V16.1367H16.6051V18.6357H17.4957V19.5Z'
        fill='white'
      />
    </svg>
  )
}

export function FileRarIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#B91C1C' />
      <path
        d='M7.80211 18.0205H7.48277V19.5H6.40758V15.2725H8.03062C9.01793 15.2725 9.60973 15.7939 9.60973 16.667C9.60973 17.209 9.33141 17.6689 8.88902 17.8623L9.72105 19.5H8.51402L7.80211 18.0205ZM7.48277 16.084V17.2617H7.88121C8.26793 17.2617 8.51109 17.0303 8.51109 16.6641C8.51109 16.3066 8.27086 16.084 7.87828 16.084H7.48277ZM12.6826 19.5L12.4863 18.5713H11.4141L11.2119 19.5H10.1455L11.3408 15.2725H12.6562L13.8545 19.5H12.6826ZM11.9297 16.2246L11.584 17.7979H12.3193L11.9854 16.2246H11.9297ZM15.9401 18.0205H15.6207V19.5H14.5455V15.2725H16.1686C17.1559 15.2725 17.7477 15.7939 17.7477 16.667C17.7477 17.209 17.4694 17.6689 17.027 17.8623L17.859 19.5H16.652L15.9401 18.0205ZM15.6207 16.084V17.2617H16.0192C16.4059 17.2617 16.6491 17.0303 16.6491 16.6641C16.6491 16.3066 16.4088 16.084 16.0163 16.084H15.6207Z'
        fill='white'
      />
    </svg>
  )
}

export function FileZipIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M17.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9.5 6C9.5 6.27614 9.27614 6.5 9 6.5C8.72386 6.5 8.5 6.27614 8.5 6C8.5 5.72386 8.72386 5.5 9 5.5C9.27614 5.5 9.5 5.72386 9.5 6Z'
        stroke='currentColor'
        fill='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M11.5 8C11.5 8.27614 11.2761 8.5 11 8.5C10.7239 8.5 10.5 8.27614 10.5 8C10.5 7.72386 10.7239 7.5 11 7.5C11.2761 7.5 11.5 7.72386 11.5 8Z'
        stroke='currentColor'
        fill='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9.5 10C9.5 10.2761 9.27614 10.5 9 10.5C8.72386 10.5 8.5 10.2761 8.5 10C8.5 9.72386 8.72386 9.5 9 9.5C9.27614 9.5 9.5 9.72386 9.5 10Z'
        stroke='currentColor'
        fill='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M11.5 12C11.5 12.2761 11.2761 12.5 11 12.5C10.7239 12.5 10.5 12.2761 10.5 12C10.5 11.7239 10.7239 11.5 11 11.5C11.2761 11.5 11.5 11.7239 11.5 12Z'
        stroke='currentColor'
        fill='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function FileTarIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#0369A1' />
      <path
        d='M8.46715 19.5H7.39488V16.1367H6.23473V15.2725H9.6273V16.1367H8.46715V19.5ZM12.6826 19.5L12.4863 18.5713H11.4141L11.2119 19.5H10.1455L11.3408 15.2725H12.6562L13.8545 19.5H12.6826ZM11.9297 16.2246L11.584 17.7979H12.3193L11.9854 16.2246H11.9297ZM15.9401 18.0205H15.6207V19.5H14.5455V15.2725H16.1686C17.1559 15.2725 17.7477 15.7939 17.7477 16.667C17.7477 17.209 17.4694 17.6689 17.027 17.8623L17.859 19.5H16.652L15.9401 18.0205ZM15.6207 16.084V17.2617H16.0192C16.4059 17.2617 16.6491 17.0303 16.6491 16.6641C16.6491 16.3066 16.4088 16.084 16.0163 16.084H15.6207Z'
        fill='white'
      />
    </svg>
  )
}

export function FileLogIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#475569' />
      <path
        d='M9.47789 18.6123V19.5H6.68297V15.2725H7.74059V18.6123H9.47789ZM13.6846 17.6982C13.6846 18.8789 13.0547 19.585 12 19.585C10.9453 19.585 10.3154 18.8789 10.3154 17.6982V17.0742C10.3154 15.8936 10.9453 15.1875 12 15.1875C13.0547 15.1875 13.6846 15.8936 13.6846 17.0742V17.6982ZM12 18.6943C12.4072 18.6943 12.5918 18.3779 12.5918 17.6865V17.0859C12.5918 16.3945 12.4072 16.0781 12 16.0781C11.5928 16.0781 11.4082 16.3945 11.4082 17.0859V17.6865C11.4082 18.3779 11.5928 18.6943 12 18.6943ZM16.6813 18.0615V17.9326H16.0368V17.1943H17.7741V18.0615C17.7741 18.9961 17.1442 19.585 16.151 19.585C15.07 19.585 14.4342 18.9463 14.4342 17.8535V16.9189C14.4342 15.8262 15.07 15.1875 16.151 15.1875C17.1295 15.1875 17.7448 15.7646 17.7682 16.7109H16.6754C16.6549 16.3301 16.4352 16.0869 16.1159 16.0869C15.7262 16.0869 15.527 16.3682 15.527 16.9189V17.8535C15.527 18.4072 15.7291 18.6855 16.1334 18.6855C16.4791 18.6855 16.6813 18.457 16.6813 18.0615Z'
        fill='white'
      />
    </svg>
  )
}

export function FileApkIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#20CF73' />
      <path
        d='M8.61363 19.5L8.41734 18.5713H7.34508L7.14293 19.5H6.07652L7.27184 15.2725H8.58727L9.78551 19.5H8.61363ZM7.8607 16.2246L7.515 17.7979H8.25035L7.91637 16.2246H7.8607ZM10.4707 15.2725H12.126C13.0693 15.2725 13.6494 15.8438 13.6494 16.7725C13.6494 17.6895 13.04 18.2607 12.0615 18.2607H11.5459V19.5H10.4707V15.2725ZM11.5459 16.0898V17.4434H11.8535C12.3457 17.4434 12.5625 17.2354 12.5625 16.7666C12.5625 16.2979 12.3457 16.0898 11.8535 16.0898H11.5459ZM15.5534 19.5H14.5485V15.2725H15.5534V17.0889H15.6061L16.9069 15.2725H17.9967L16.6227 17.1387L18.0465 19.5H16.8248L15.8756 17.8564L15.5534 18.3047V19.5Z'
        fill='white'
      />
    </svg>
  )
}

export function FileSqlIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#1D4ED8' />
      <path
        d='M6.25816 18.2812H7.25719C7.28355 18.5918 7.52379 18.7588 7.94566 18.7588C8.32066 18.7588 8.55211 18.5859 8.55211 18.3047C8.55211 18.0674 8.40855 17.9561 7.98375 17.8652L7.48277 17.7568C6.73277 17.5957 6.34312 17.1768 6.34312 16.541C6.34312 15.7119 6.95543 15.1875 7.92809 15.1875C8.87437 15.1875 9.51012 15.7061 9.52477 16.4912H8.52574C8.50816 16.1953 8.28551 16.0107 7.9398 16.0107C7.61168 16.0107 7.40367 16.1689 7.40367 16.418C7.40367 16.6758 7.55602 16.8105 7.9398 16.8896L8.4232 16.9922C9.23766 17.1621 9.60387 17.5342 9.60387 18.1846C9.60387 19.0693 8.9857 19.585 7.92223 19.585C6.89684 19.585 6.27574 19.0986 6.25816 18.2812ZM12.6562 19.9482L12.4307 19.541C12.2959 19.5703 12.1523 19.585 12 19.585C10.9453 19.585 10.3154 18.8789 10.3154 17.6982V17.0742C10.3154 15.8936 10.9453 15.1875 12 15.1875C13.0547 15.1875 13.6846 15.8936 13.6846 17.0742V17.6982C13.6846 18.3252 13.5059 18.8174 13.1836 19.1426L13.6289 19.9482H12.6562ZM11.376 17.7041C11.376 18.4277 11.5723 18.7617 12 18.7617L11.6602 18.1494H12.5918C12.6123 18.0205 12.624 17.874 12.624 17.7041V17.1357C12.624 16.4121 12.4277 16.0781 12 16.0781C11.5723 16.0781 11.376 16.4121 11.376 17.1357V17.7041ZM17.6159 18.6123V19.5H14.8209V15.2725H15.8786V18.6123H17.6159Z'
        fill='white'
      />
    </svg>
  )
}

export function FileXmlIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#15803D' />
      <path
        d='M6.07652 19.5L7.26305 17.3672L6.07652 15.2725H7.24254L7.93102 16.6729H7.98375L8.67223 15.2725H9.78551L8.54918 17.3789L9.78551 19.5H8.66051L7.92223 18.1611H7.87242L7.14 19.5H6.07652ZM11.25 18.2402V19.5H10.3711V15.2725H11.458L11.9707 17.5723H12.0293L12.542 15.2725H13.6289V19.5H12.75V18.2402L12.9141 16.5674H12.835L12.3428 18.5068H11.6572L11.165 16.5674H11.0859L11.25 18.2402ZM17.6159 18.6123V19.5H14.8209V15.2725H15.8786V18.6123H17.6159Z'
        fill='white'
      />
    </svg>
  )
}

export function FileOggIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#7E22CE' />
      <path
        d='M9.61559 17.6982C9.61559 18.8789 8.9857 19.585 7.93102 19.585C6.87633 19.585 6.24645 18.8789 6.24645 17.6982V17.0742C6.24645 15.8936 6.87633 15.1875 7.93102 15.1875C8.9857 15.1875 9.61559 15.8936 9.61559 17.0742V17.6982ZM7.93102 18.6943C8.33824 18.6943 8.52281 18.3779 8.52281 17.6865V17.0859C8.52281 16.3945 8.33824 16.0781 7.93102 16.0781C7.52379 16.0781 7.33922 16.3945 7.33922 17.0859V17.6865C7.33922 18.3779 7.52379 18.6943 7.93102 18.6943ZM12.6123 18.0615V17.9326H11.9678V17.1943H13.7051V18.0615C13.7051 18.9961 13.0752 19.585 12.082 19.585C11.001 19.585 10.3652 18.9463 10.3652 17.8535V16.9189C10.3652 15.8262 11.001 15.1875 12.082 15.1875C13.0605 15.1875 13.6758 15.7646 13.6992 16.7109H12.6064C12.5859 16.3301 12.3662 16.0869 12.0469 16.0869C11.6572 16.0869 11.458 16.3682 11.458 16.9189V17.8535C11.458 18.4072 11.6602 18.6855 12.0645 18.6855C12.4102 18.6855 12.6123 18.457 12.6123 18.0615ZM16.6813 18.0615V17.9326H16.0368V17.1943H17.7741V18.0615C17.7741 18.9961 17.1442 19.585 16.151 19.585C15.07 19.585 14.4342 18.9463 14.4342 17.8535V16.9189C14.4342 15.8262 15.07 15.1875 16.151 15.1875C17.1295 15.1875 17.7448 15.7646 17.7682 16.7109H16.6754C16.6549 16.3301 16.4352 16.0869 16.1159 16.0869C15.7262 16.0869 15.527 16.3682 15.527 16.9189V17.8535C15.527 18.4072 15.7291 18.6855 16.1334 18.6855C16.4791 18.6855 16.6813 18.457 16.6813 18.0615Z'
        fill='white'
      />
    </svg>
  )
}

export function FileQtzIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#3D8BE8' />
      <path
        d='M8.58727 19.9482L8.36168 19.541C8.22691 19.5703 8.08336 19.585 7.93102 19.585C6.87633 19.585 6.24645 18.8789 6.24645 17.6982V17.0742C6.24645 15.8936 6.87633 15.1875 7.93102 15.1875C8.9857 15.1875 9.61559 15.8936 9.61559 17.0742V17.6982C9.61559 18.3252 9.43687 18.8174 9.11461 19.1426L9.55992 19.9482H8.58727ZM7.30699 17.7041C7.30699 18.4277 7.50328 18.7617 7.93102 18.7617L7.59117 18.1494H8.52281C8.54332 18.0205 8.55504 17.874 8.55504 17.7041V17.1357C8.55504 16.4121 8.35875 16.0781 7.93102 16.0781C7.50328 16.0781 7.30699 16.4121 7.30699 17.1357V17.7041ZM12.5361 19.5H11.4639V16.1367H10.3037V15.2725H13.6963V16.1367H12.5361V19.5ZM14.5954 19.5V18.8174L16.2946 16.1924V16.1367H14.6276V15.2725H17.5983V15.9551L15.8991 18.5801V18.6357H17.6598V19.5H14.5954Z'
        fill='white'
      />
    </svg>
  )
}

export function FileM4aIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.7499 4.75H7.74994C7.21951 4.75 6.7108 4.96071 6.33573 5.33579C5.96065 5.71086 5.74994 6.21957 5.74994 6.75L5.74999 12.5M12.7499 4.75V8.25C12.7499 8.78043 12.9607 9.28914 13.3357 9.66421C13.7108 10.0393 14.2195 10.25 14.7499 10.25H18.2499M12.7499 4.75L18.2499 10.25M18.2499 10.25V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='4' y='14' width='16' height='7' rx='1.5' fill='#5B21B6' />
      <path
        d='M7.18102 18.2402V19.5H6.30211V15.2725H7.38902L7.90172 17.5723H7.96031L8.47301 15.2725H9.55992V19.5H8.68102V18.2402L8.84508 16.5674H8.76598L8.27379 18.5068H7.58824L7.09605 16.5674H7.01695L7.18102 18.2402ZM12.2109 19.5V18.7559H10.3506V17.9414L11.5225 15.2725H12.6035L11.4902 17.8711V17.9355H12.252V16.9512H13.2012V17.959H13.7227V18.7559H13.2246V19.5H12.2109ZM16.7516 19.5L16.5553 18.5713H15.483L15.2809 19.5H14.2145L15.4098 15.2725H16.7252L17.9235 19.5H16.7516ZM15.9987 16.2246L15.653 17.7979H16.3883L16.0543 16.2246H15.9987Z'
        fill='white'
      />
    </svg>
  )
}

export function FileJsonIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.75 4.75H7.75C7.21957 4.75 6.71086 4.96071 6.33579 5.33579C5.96071 5.71086 5.75 6.21957 5.75 6.75V17.25C5.75 17.7804 5.96071 18.2891 6.33579 18.6642C6.71086 19.0393 7.21957 19.25 7.75 19.25H8.25M12.75 4.75V8.25C12.75 8.78043 12.9607 9.28914 13.3358 9.66421C13.7109 10.0393 14.2196 10.25 14.75 10.25H18.25L12.75 4.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10.8622 18.6924V17.875C10.8622 17.2949 10.6952 17.2202 10.4975 17.1323C10.2953 17.04 10.0712 16.873 10.0712 16.4336C10.0712 15.9502 10.3305 15.8096 10.5238 15.7217C10.6996 15.6426 10.8622 15.5635 10.8622 14.9966V14.355C10.8622 13.1245 11.5609 12.6851 12.6068 12.6851C13.1737 12.6851 13.5033 12.7993 13.5033 13.3047C13.5033 13.6958 13.2968 13.7749 12.9496 13.8672C12.5541 13.9727 12.475 14.1265 12.475 14.645V15.4097C12.475 16.0688 12.1234 16.3062 11.495 16.3633V16.5039C12.1234 16.561 12.475 16.9258 12.475 17.5894V18.4331C12.475 18.9517 12.5541 19.1055 12.9496 19.2109C13.2924 19.3032 13.5033 19.3779 13.5033 19.7734C13.5033 20.27 13.1869 20.3931 12.6112 20.3931C11.5609 20.3931 10.8622 19.9229 10.8622 18.6924ZM18.1334 18.6924C18.1334 19.9229 17.4347 20.3931 16.3844 20.3931C15.8043 20.3931 15.4923 20.27 15.4923 19.7734C15.4923 19.3779 15.7032 19.3032 16.046 19.2109C16.4415 19.1055 16.5206 18.9517 16.5206 18.4331V17.5894C16.5206 16.9258 16.8722 16.561 17.5006 16.5039V16.3633C16.8722 16.3062 16.5206 16.0688 16.5206 15.4097V14.645C16.5206 14.1265 16.4415 13.9727 16.046 13.8672C15.6988 13.7749 15.4923 13.6958 15.4923 13.3047C15.4923 12.7993 15.8219 12.6851 16.3888 12.6851C17.4347 12.6851 18.1334 13.1245 18.1334 14.355V14.9966C18.1334 15.5635 18.296 15.6426 18.4674 15.7217C18.6651 15.8096 18.92 15.9502 18.92 16.4336C18.92 16.873 18.7003 17.04 18.4981 17.1323C18.296 17.2202 18.1334 17.2949 18.1334 17.875V18.6924Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function FileMarkdownIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M9 18V13H10.5484L12.0968 14.8382L13.6452 13H15.1935V18H13.6452V15.1324L12.0968 16.9706L10.5484 15.1324V18H9ZM18.6774 18L16.3548 15.5735H17.9032V13H19.4516V15.5735H21L18.6774 18Z'
        fill='currentColor'
      />
      <path
        d='M12.75 4.75H7.75C7.21957 4.75 6.71086 4.96071 6.33579 5.33579C5.96071 5.71086 5.75 6.21957 5.75 6.75V17.25C5.75 17.7804 5.96071 18.2891 6.33579 18.6642M12.75 4.75V8.25C12.75 8.78043 12.9607 9.28914 13.3358 9.66421C13.7109 10.0393 14.2196 10.25 14.75 10.25H18.25L12.75 4.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function PolaroidsIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M18.9441 8.2758C18.544 8.16859 18.1328 8.40603 18.0256 8.80613C17.9183 9.20623 18.1558 9.61748 18.5559 9.72469L18.9441 8.2758ZM15.7662 19.2153L15.9603 18.4909L15.9527 18.4889L15.7662 19.2153ZM19.2155 10.2338L19.9399 10.4279L19.9399 10.4279L19.2155 10.2338ZM16.9997 18.5032L16.2753 18.309L16.9997 18.5032ZM9.93656 16.9439C9.53536 16.8408 9.12661 17.0825 9.02357 17.4837C8.92054 17.8849 9.16225 18.2937 9.56344 18.3967L9.93656 16.9439ZM15.5721 19.9398C16.5095 20.191 17.473 19.6347 17.7242 18.6973L16.2753 18.309C16.2385 18.4462 16.0975 18.5277 15.9603 18.4909L15.5721 19.9398ZM18.5559 9.72469C18.5743 9.72962 18.5596 9.7289 18.5382 9.70736C18.5184 9.68753 18.5164 9.67351 18.5201 9.68574C18.5246 9.70094 18.5322 9.73907 18.5296 9.80522C18.5271 9.87034 18.5151 9.94993 18.4911 10.0397L19.9399 10.4279C20.0319 10.0845 20.0786 9.65912 19.9564 9.2533C19.8201 8.80078 19.4827 8.4201 18.9441 8.2758L18.5559 9.72469ZM18.4911 10.0397L16.2753 18.309L17.7242 18.6973L19.9399 10.4279L18.4911 10.0397ZM15.9527 18.4889L9.93656 16.9439L9.56344 18.3967L15.5796 19.9418L15.9527 18.4889ZM5.75 5.49976H14.25V3.99976H5.75V5.49976ZM14.25 14.4998H5.75V15.9998H14.25V14.4998ZM5.5 14.2498V12.7498H4V14.2498H5.5ZM5.5 12.7498V5.74976H4V12.7498H5.5ZM14.5 5.74976V12.7498H16V5.74976H14.5ZM14.5 12.7498V14.2498H16V12.7498H14.5ZM4.75 13.4998H15.25V11.9998H4.75V13.4998ZM14.25 15.9998C15.2165 15.9998 16 15.2163 16 14.2498H14.5C14.5 14.3878 14.3881 14.4998 14.25 14.4998V15.9998ZM14.25 5.49976C14.3881 5.49976 14.5 5.61168 14.5 5.74976H16C16 4.78326 15.2165 3.99976 14.25 3.99976V5.49976ZM5.75 3.99976C4.7835 3.99976 4 4.78326 4 5.74976H5.5C5.5 5.61168 5.61193 5.49976 5.75 5.49976V3.99976ZM5.75 14.4998C5.61193 14.4998 5.5 14.3878 5.5 14.2498H4C4 15.2163 4.7835 15.9998 5.75 15.9998V14.4998Z'
        fill='currentColor'
      ></path>
    </svg>
  )
}

export function PolaroidsPlusIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M17.9441 10.2758C17.544 10.1686 17.1328 10.406 17.0256 10.8061C16.9183 11.2062 17.1558 11.6175 17.5559 11.7247L17.9441 10.2758ZM14.7662 21.2153L14.9603 20.4909L14.9527 20.4889L14.7662 21.2153ZM8.93656 18.9439C8.53536 18.8408 8.12661 19.0825 8.02357 19.4837C7.92054 19.8849 8.16225 20.2937 8.56344 20.3967L8.93656 18.9439ZM14.5721 21.9398C15.5095 22.191 16.473 21.6347 16.7242 20.6973L15.2753 20.309C15.2385 20.4462 15.0975 20.5277 14.9603 20.4909L14.5721 21.9398ZM17.5559 11.7247C17.5743 11.7296 17.5596 11.7289 17.5382 11.7074C17.5184 11.6875 17.5164 11.6735 17.5201 11.6857C17.5246 11.7009 17.5322 11.7391 17.5296 11.8052C17.5271 11.8703 17.5151 11.9499 17.4911 12.0397L18.9399 12.4279C19.0319 12.0845 19.0786 11.6591 18.9564 11.2533C18.8201 10.8008 18.4827 10.4201 17.9441 10.2758L17.5559 11.7247ZM17.4911 12.0397L15.2753 20.309L16.7242 20.6973L18.9399 12.4279L17.4911 12.0397ZM14.9527 20.4889L8.93656 18.9439L8.56344 20.3967L14.5796 21.9418L14.9527 20.4889ZM4.75 7.49976H13.25V5.99976H4.75V7.49976ZM13.25 16.4998H4.75V17.9998H13.25V16.4998ZM4.5 16.2498V14.7498H3V16.2498H4.5ZM4.5 14.7498V7.74976H3V14.7498H4.5ZM13.5 7.74976V14.7498H15V7.74976H13.5ZM13.5 14.7498V16.2498H15V14.7498H13.5ZM3.75 15.4998H14.25V13.9998H3.75V15.4998ZM13.25 17.9998C14.2165 17.9998 15 17.2163 15 16.2498H13.5C13.5 16.3878 13.3881 16.4998 13.25 16.4998V17.9998ZM13.25 7.49976C13.3881 7.49976 13.5 7.61168 13.5 7.74976H15C15 6.78326 14.2165 5.99976 13.25 5.99976V7.49976ZM4.75 5.99976C3.7835 5.99976 3 6.78326 3 7.74976H4.5C4.5 7.61168 4.61193 7.49976 4.75 7.49976V5.99976ZM4.75 16.4998C4.61193 16.4998 4.5 16.3878 4.5 16.2498H3C3 17.2163 3.7835 17.9998 4.75 17.9998V16.4998Z'
        fill='currentColor'
      />
      <path
        d='M19.125 3V5.125M19.125 7.25V5.125M19.125 5.125H17M19.125 5.125H21.25'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinecap='round'
      />
    </svg>
  )
}

export function FireIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M18.2499 14C18.2499 18 15.5 19.25 11.9999 19.25C8 19.25 5.75 16.4 5.75 14C5.75 11.6 7 9.41667 8 8.75C8 11.55 10.6666 13.3333 11.9999 13.25C9.59994 9.65 11.6666 5.66667 12.9999 4.75C12.9999 9.25 18.2499 10 18.2499 14Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function HeartIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M11.995 7.23319C10.5455 5.60999 8.12832 5.17335 6.31215 6.65972C4.49599 8.14609 4.2403 10.6312 5.66654 12.3892L11.995 18.25L18.3235 12.3892C19.7498 10.6312 19.5253 8.13046 17.6779 6.65972C15.8305 5.18899 13.4446 5.60999 11.995 7.23319Z'
        clipRule='evenodd'
      ></path>
    </svg>
  )
}

export function HeartFillIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.995 7.2332C10.5455 5.61 8.12832 5.17336 6.31215 6.65973C4.49599 8.1461 4.2403 10.6312 5.66654 12.3892L11.995 18.25L18.3235 12.3892C19.7498 10.6312 19.5253 8.13047 17.6779 6.65973C15.8305 5.189 13.4446 5.61 11.995 7.2332Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ThumbsUpIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        fill='currentColor'
        d='M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z'
      />
    </svg>
  )
}

export function ThumbsDownIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        fill='currentColor'
        d='M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.499 4.499 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 22a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521C4.537 4.247 5.136 4 5.754 4H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23ZM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z'
      />
    </svg>
  )
}

export function TagIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <circle cx='15' cy='9' r='1' fill='currentColor'></circle>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M12 4.75H19.25V12L12.5535 18.6708C11.7544 19.4668 10.4556 19.445 9.68369 18.6226L5.28993 13.941C4.54041 13.1424 4.57265 11.8895 5.36226 11.1305L12 4.75Z'
      ></path>
    </svg>
  )
}

export function BellIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M17.25 12V10C17.25 7.1005 14.8995 4.75 12 4.75C9.10051 4.75 6.75 7.10051 6.75 10V12L4.75 16.25H19.25L17.25 12Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M9 16.75C9 16.75 9 19.25 12 19.25C15 19.25 15 16.75 15 16.75'
      ></path>
    </svg>
  )
}

export function BellMentionIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M9 16.5C9 16.5 9 19.25 12 19.25C15 19.25 15 16.5 15 16.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.43246 5.77954C7.29783 6.6437 6.75781 8.16116 6.75781 9.99997V12L4.75781 16.25H19.2578L18.6289 14.875'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <g clipPath='url(#clip0_5293_50)'>
        <path
          d='M15.9999 9.80557C16.9971 9.80557 17.8054 8.99719 17.8054 8.00001C17.8054 7.00283 16.9971 6.19446 15.9999 6.19446C15.0027 6.19446 14.1943 7.00283 14.1943 8.00001C14.1943 8.99719 15.0027 9.80557 15.9999 9.80557Z'
          stroke='currentColor'
          strokeWidth='1.5625'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M16.0004 12.0277C13.776 12.0277 11.9727 10.2244 11.9727 7.99995C11.9727 5.77547 13.776 3.97217 16.0004 3.97217C19.7852 3.97217 20.0282 6.40272 20.0282 7.99995V8.69439C20.0282 9.30806 19.5308 9.8055 18.9171 9.8055C18.3034 9.8055 17.806 9.30806 17.806 8.69439V6.19439'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
    </svg>
  )
}

export function BellCheckIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M9 16.5C9 16.5 9 19.25 12 19.25C15 19.25 15 16.5 15 16.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12 4.75C9.10051 4.75 6.75 7.10051 6.75 10V12L4.75 16.25H19.25L17.6089 12.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12.75 8.05L14.9167 10.25L19.25 4.75'
        stroke='#16A34A'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function FeedIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M6 6C6 4.8954 6.80279 4 7.79308 4H17.2069C18.1972 4 19 4.8954 19 6'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M18 8H7C5.89543 8 5 8.89543 5 10V17C5 18.1046 5.89543 19 7 19H7.91667H17.0833H18C19.1046 19 20 18.1046 20 17V10C20 8.89543 19.1046 8 18 8Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
      />
    </svg>
  )
}

export function PreferenceIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M14.75 9.5C15.5784 9.5 16.25 8.82843 16.25 8C16.25 7.17157 15.5784 6.5 14.75 6.5C13.9216 6.5 13.25 7.17157 13.25 8C13.25 8.82843 13.9216 9.5 14.75 9.5ZM20.75 8.75H17.6555C17.3225 10.0439 16.1479 11 14.75 11C13.3521 11 12.1775 10.0439 11.8445 8.75H2.75C2.33579 8.75 2 8.41421 2 8C2 7.58579 2.33579 7.25 2.75 7.25H11.8445C12.1775 5.95608 13.3521 5 14.75 5C16.1479 5 17.3225 5.95608 17.6555 7.25H20.75C21.1642 7.25 21.5 7.58579 21.5 8C21.5 8.41421 21.1642 8.75 20.75 8.75ZM8.75 18.5C7.92157 18.5 7.25 17.8284 7.25 17C7.25 16.1716 7.92157 15.5 8.75 15.5C9.57843 15.5 10.25 16.1716 10.25 17C10.25 17.8284 9.57843 18.5 8.75 18.5ZM2.75 17.75H5.84451C6.17754 19.0439 7.35212 20 8.75 20C10.1479 20 11.3225 19.0439 11.6555 17.75H20.75C21.1642 17.75 21.5 17.4142 21.5 17C21.5 16.5858 21.1642 16.25 20.75 16.25H11.6555C11.3225 14.9561 10.1479 14 8.75 14C7.35212 14 6.17754 14.9561 5.84451 16.25H2.75C2.33579 16.25 2 16.5858 2 17C2 17.4142 2.33579 17.75 2.75 17.75Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function ActivityIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M4.75 11.75H8.25L10.25 4.75L13.75 19.25L15.75 11.75H19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function BellOffIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M17.25 6.875V12L19.25 16.25H7.75M5.75 14.125L6.75 12V10C6.75 7.10051 9.10051 4.75 12 4.75C12 4.75 13.6094 4.75002 14.5938 5.24998'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M9 16.75C9 16.75 9 19.25 12 19.25C15 19.25 15 16.75 15 16.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M19.25 4.75L4.75 19.25'
      ></path>
    </svg>
  )
}

export function ProjectIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M15.25 10C15.25 12.8995 12.8995 15.25 10 15.25C7.10051 15.25 4.75 12.8995 4.75 10C4.75 7.10051 7.10051 4.75 10 4.75C12.8995 4.75 15.25 7.10051 15.25 10Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19.25 14C19.25 16.8995 16.8995 19.25 14 19.25C11.1005 19.25 8.75 16.8995 8.75 14C8.75 11.1005 11.1005 8.75 14 8.75C16.8995 8.75 19.25 11.1005 19.25 14Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function CirclePlusIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M12.25 4.75H12A7.25 7.25 0 1 0 19.25 12v-.25m-2.25-7V7m0 0v2.25M17 7h2.25M17 7h-2.25'
      ></path>
    </svg>
  )
}

export function ArchiveIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M18.25 8.75H5.75L6.57758 17.4396C6.67534 18.4661 7.53746 19.25 8.56857 19.25H15.4314C16.4625 19.25 17.3247 18.4661 17.4224 17.4396L18.25 8.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M19.25 5.75C19.25 5.19772 18.8023 4.75 18.25 4.75H5.75C5.19771 4.75 4.75 5.19772 4.75 5.75V7.75C4.75 8.30228 5.19772 8.75 5.75 8.75H18.25C18.8023 8.75 19.25 8.30228 19.25 7.75V5.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M9.75 13.25H14.25'
      ></path>
    </svg>
  )
}

export function QRCodeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M7.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25L4.75 16.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M5.75 12.75L8.25 12.75C9.35457 12.75 10.25 13.6454 10.25 14.75L10.25 16.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M18.25 14.75L15.75 14.75C15.1977 14.75 14.75 15.1977 14.75 15.75L14.75 18.25C14.75 18.8023 15.1977 19.25 15.75 19.25L18.25 19.25C18.8023 19.25 19.25 18.8023 19.25 18.25V15.75C19.25 15.1977 18.8023 14.75 18.25 14.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12.75 11.25L19.25 11.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12.75 7.75L15.25 7.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M15.75 4.75L17.25 4.75C18.3546 4.75 19.25 5.64543 19.25 6.75L19.25 8.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M8.25 4.75L5.75 4.75C5.19772 4.75 4.75 5.19772 4.75 5.75L4.75 8.25C4.75 8.80228 5.19772 9.25 5.75 9.25L8.25 9.25C8.80228 9.25 9.25 8.80228 9.25 8.25L9.25 5.75C9.25 5.19772 8.80228 4.75 8.25 4.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ExternalLinkIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M6.72895 20C5.8193 20 5.13561 19.774 4.67789 19.3221C4.22596 18.876 4 18.2039 4 17.3058V6.69419C4 5.79613 4.22596 5.12403 4.67789 4.67789C5.13561 4.22596 5.8193 4 6.72895 4H17.271C18.1807 4 18.8615 4.22596 19.3134 4.67789C19.7711 5.12403 20 5.79613 20 6.69419V17.3058C20 18.2039 19.7711 18.876 19.3134 19.3221C18.8615 19.774 18.1807 20 17.271 20H6.72895ZM6.74633 18.6008H17.2537C17.6824 18.6008 18.0127 18.4878 18.2444 18.2618C18.482 18.0301 18.6008 17.6882 18.6008 17.2363V6.76372C18.6008 6.31179 18.482 5.97284 18.2444 5.74688C18.0127 5.51512 17.6824 5.39924 17.2537 5.39924H6.74633C6.31179 5.39924 5.97863 5.51512 5.74688 5.74688C5.51512 5.97284 5.39924 6.31179 5.39924 6.76372V17.2363C5.39924 17.6882 5.51512 18.0301 5.74688 18.2618C5.97863 18.4878 6.31179 18.6008 6.74633 18.6008ZM14.7333 14.1336C14.5421 14.1336 14.3857 14.0728 14.264 13.9511C14.1481 13.8294 14.0902 13.6643 14.0902 13.4557V11.9522L14.2205 10.6051L12.9777 11.9348L9.77078 15.1418C9.63752 15.275 9.47239 15.3417 9.27539 15.3417C9.08419 15.3417 8.93065 15.2837 8.81477 15.1678C8.6989 15.0462 8.64096 14.8868 8.64096 14.6898C8.64096 14.5218 8.71048 14.3683 8.84954 14.2292L12.0565 11.0223L13.4036 9.76209L12.1173 9.90114H10.5356C10.327 9.90114 10.159 9.8432 10.0315 9.72732C9.90983 9.61144 9.849 9.45501 9.849 9.25801C9.849 9.06681 9.90983 8.91327 10.0315 8.79739C10.1532 8.68151 10.3154 8.62357 10.5182 8.62357H14.6464C14.8666 8.62357 15.0404 8.67862 15.1678 8.7887C15.3011 8.89879 15.3677 9.08419 15.3677 9.34492V13.4383C15.3677 13.6411 15.3098 13.8092 15.1939 13.9424C15.078 14.0699 14.9245 14.1336 14.7333 14.1336Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function ShareIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M8.25 10.75h-.5a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-4.5a2 2 0 0 0-2-2h-.5M12 14.25v-9.5m0 0-2.25 2.5M12 4.75l2.25 2.5'
      ></path>
    </svg>
  )
}

export function SidebarIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M11.25 4.75H6.75C6.21957 4.75 5.71086 4.96071 5.33579 5.33579C4.96071 5.71086 4.75 6.21957 4.75 6.75V17.25C4.75 17.7804 4.96071 18.2891 5.33579 18.6642C5.71086 19.0393 6.21957 19.25 6.75 19.25H11.25M19.25 17.25V6.75C19.25 6.21957 19.0393 5.71086 18.6642 5.33579C18.2891 4.96071 17.7804 4.75 17.25 4.75H14.75V19.25H17.25C17.7804 19.25 18.2891 19.0393 18.6642 18.6642C19.0393 18.2891 19.25 17.7804 19.25 17.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ReorderDotsIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M11 6C11 6.27614 10.7761 6.5 10.5 6.5C10.2239 6.5 10 6.27614 10 6C10 5.72386 10.2239 5.5 10.5 5.5C10.7761 5.5 11 5.72386 11 6Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth={strokeWidth}
        strokeLinejoin='round'
      />
      <path
        d='M11 12C11 12.2761 10.7761 12.5 10.5 12.5C10.2239 12.5 10 12.2761 10 12C10 11.7239 10.2239 11.5 10.5 11.5C10.7761 11.5 11 11.7239 11 12Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth={strokeWidth}
        strokeLinejoin='round'
      />
      <path
        d='M5 6C5 6.27614 4.77614 6.5 4.5 6.5C4.22386 6.5 4 6.27614 4 6C4 5.72386 4.22386 5.5 4.5 5.5C4.77614 5.5 5 5.72386 5 6Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth={strokeWidth}
        strokeLinejoin='round'
      />
      <path
        d='M5 12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12C4 11.7239 4.22386 11.5 4.5 11.5C4.77614 11.5 5 11.7239 5 12Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth={strokeWidth}
        strokeLinejoin='round'
      />
      <path
        d='M11 18C11 18.2761 10.7761 18.5 10.5 18.5C10.2239 18.5 10 18.2761 10 18C10 17.7239 10.2239 17.5 10.5 17.5C10.7761 17.5 11 17.7239 11 18Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth={strokeWidth}
        strokeLinejoin='round'
      />
      <path
        d='M5 18C5 18.2761 4.77614 18.5 4.5 18.5C4.22386 18.5 4 18.2761 4 18C4 17.7239 4.22386 17.5 4.5 17.5C4.77614 17.5 5 17.7239 5 18Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth={strokeWidth}
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ReorderHandlesIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path d='M6 9H19' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round' />
      <path d='M6 15H19' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export function ListIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path d='M6 8H18' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round' />
      <path d='M6 12H18' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round' />
      <path d='M6 16H14' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export function UnorderedListIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M6.5 8C6.5 8.27614 6.27614 8.5 6 8.5C5.72386 8.5 5.5 8.27614 5.5 8C5.5 7.72386 5.72386 7.5 6 7.5C6.27614 7.5 6.5 7.72386 6.5 8Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M6.5 16C6.5 16.2761 6.27614 16.5 6 16.5C5.72386 16.5 5.5 16.2761 5.5 16C5.5 15.7239 5.72386 15.5 6 15.5C6.27614 15.5 6.5 15.7239 6.5 16Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M11 8H18' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M11 16H18'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function MaximizeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M4.75 14.75V19.25H9.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M19.25 9.25V4.75H14.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M5 19L10.25 13.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M19 5L13.75 10.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function MaximizeOutlineIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 14.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H9.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M19.25 14.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H14.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M19.25 9.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75H14.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 9.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H9.25'
      ></path>
    </svg>
  )
}

export function HandIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M11.25 8v3.25m0-3.25V6a1.25 1.25 0 1 1 2.5 0v5.25M11.25 8a1.25 1.25 0 0 0-2.5 0v5.25l-1.604-1.923c-.611-.733-1.728-.754-2.391-.066m0 0 1.978 4.87a5 5 0 0 0 4.633 3.119h3.884c2.21 0 3.5-1.79 3.5-4V9a1.25 1.25 0 0 0-2.5 0M4.755 11.26c-.003-.006-.005.006 0 0ZM13.75 9V7a1.25 1.25 0 1 1 2.5 0v4.25'
      />
    </svg>
  )
}

export function BoldIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M8 12.2143H12.381C13.9589 12.2143 15.2381 10.9351 15.2381 9.35714C15.2381 7.77918 13.9589 6.5 12.381 6.5H8V12.2143ZM8 12.2143L13.3333 12.2144C14.8061 12.2144 16 13.4083 16 14.881C16 16.3538 14.8061 17.5477 13.3333 17.5477H8V12.2143Z'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ItalicIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M13.1724 6H11.3103M13.1724 6H15.0345M13.1724 6L9.86207 18M9.86207 18H8M9.86207 18H11.7241'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function GlobeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <circle
        cx='12'
        cy='12'
        r='7.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.25 12C15.25 16.5 13.2426 19.25 12 19.25C10.7574 19.25 8.75 16.5 8.75 12C8.75 7.5 10.7574 4.75 12 4.75C13.2426 4.75 15.25 7.5 15.25 12Z'
      ></path>
      <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M5 12H12H19'></path>
    </svg>
  )
}

export function HelpIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <circle
        cx='12'
        cy='12'
        r='7.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
      <circle
        cx='12'
        cy='12'
        r='3.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M7 17L9.5 14.5'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M17 17L14.5 14.5'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M9.5 9.5L7 7'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M14.5 9.5L17 7'
      ></path>
    </svg>
  )
}

export function QuoteIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M5 10.4704C5 9.81626 5.13835 9.22944 5.41504 8.70996C5.69612 8.18567 6.07603 7.7696 6.55475 7.46176C7.03347 7.15392 7.57587 7 8.18196 7C8.79683 7 9.3612 7.16835 9.87506 7.50505C10.3933 7.84175 10.8083 8.32997 11.1202 8.9697C11.432 9.60462 11.5879 10.3718 11.5879 11.2713C11.5879 12.0697 11.4584 12.8033 11.1992 13.4719C10.9445 14.1405 10.5975 14.7273 10.1583 15.2323C9.84212 15.5979 9.48198 15.9202 9.07792 16.1991C8.67825 16.4733 8.25223 16.6922 7.79986 16.8557C7.65493 16.9038 7.53635 16.9399 7.44412 16.9639C7.35189 16.988 7.25087 17 7.14107 17C6.98735 17 6.86438 16.9519 6.77215 16.8557C6.67992 16.7595 6.6338 16.6368 6.6338 16.4877C6.6338 16.406 6.64698 16.3338 6.67333 16.2713C6.69968 16.2088 6.73921 16.1558 6.79191 16.1126C6.83583 16.0693 6.89512 16.0308 6.96979 15.9971C7.04884 15.9634 7.14107 15.9274 7.24648 15.8889C7.60662 15.7734 7.9448 15.6171 8.26102 15.4199C8.58163 15.2227 8.8715 14.9966 9.13062 14.7417C9.38975 14.482 9.61154 14.1982 9.796 13.8903C9.98486 13.5825 10.1276 13.2578 10.2242 12.9163H10.0463C9.77404 13.2482 9.45782 13.4983 9.09768 13.6667C8.73754 13.835 8.36203 13.9192 7.97115 13.9192C7.41337 13.9192 6.9105 13.7653 6.46252 13.4574C6.01454 13.1496 5.65879 12.7359 5.39527 12.2165C5.13176 11.6922 5 11.1101 5 10.4704ZM12.9121 10.4704C12.9121 9.81626 13.0504 9.22944 13.3271 8.70996C13.6082 8.18567 13.9881 7.7696 14.4668 7.46176C14.9456 7.15392 15.488 7 16.094 7C16.7089 7 17.2733 7.16835 17.7871 7.50505C18.3054 7.84175 18.7204 8.32997 19.0323 8.9697C19.3441 9.60462 19.5 10.3718 19.5 11.2713C19.5 12.0697 19.3704 12.8033 19.1113 13.4719C18.8566 14.1405 18.5052 14.7273 18.0572 15.2323C17.7454 15.5979 17.3875 15.9202 16.9834 16.1991C16.5837 16.4733 16.1577 16.6922 15.7054 16.8557C15.5648 16.9038 15.4462 16.9399 15.3496 16.9639C15.2574 16.988 15.1608 17 15.0597 17C14.906 17 14.7809 16.9519 14.6842 16.8557C14.5876 16.7595 14.5393 16.6368 14.5393 16.4877C14.5393 16.406 14.5525 16.3338 14.5788 16.2713C14.6096 16.2088 14.6513 16.1558 14.704 16.1126C14.7479 16.0693 14.8072 16.0308 14.8819 15.9971C14.9565 15.9634 15.0466 15.9274 15.152 15.8889C15.5121 15.7734 15.8525 15.6171 16.1731 15.4199C16.4937 15.2227 16.7836 14.9966 17.0427 14.7417C17.3018 14.482 17.5236 14.1982 17.7081 13.8903C17.8969 13.5825 18.0375 13.2578 18.1297 12.9163H17.9584C17.6817 13.2482 17.3633 13.4983 17.0032 13.6667C16.6474 13.835 16.2741 13.9192 15.8832 13.9192C15.3255 13.9192 14.8226 13.7653 14.3746 13.4574C13.9266 13.1496 13.5709 12.7359 13.3074 12.2165C13.0438 11.6922 12.9121 11.1101 12.9121 10.4704Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function UnderlineIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M6 18.5H18M15.5169 6.5V11.6724C15.5169 13.6149 13.9422 15.1897 11.9997 15.1897C10.0571 15.1897 8.48242 13.6149 8.48242 11.6724V6.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function StrikeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path
        d='M11.7453 19C10.8878 19 10.1086 18.8803 9.40763 18.641C8.7129 18.4017 8.13083 18.0648 7.66142 17.6302C7.192 17.1957 6.87593 16.6793 6.7132 16.081C6.66313 15.9109 6.6381 15.7346 6.6381 15.552C6.6381 15.3063 6.71007 15.1111 6.85403 14.9663C7.00424 14.8214 7.20452 14.749 7.45488 14.749C7.6489 14.749 7.80224 14.7962 7.9149 14.8907C8.03382 14.9789 8.13709 15.1269 8.22471 15.3347C8.38744 15.7818 8.63467 16.166 8.96638 16.4872C9.2981 16.8084 9.69867 17.054 10.1681 17.224C10.6375 17.3941 11.1632 17.4791 11.7453 17.4791C12.3962 17.4791 12.972 17.3783 13.4727 17.1768C13.9797 16.969 14.374 16.6887 14.6557 16.336C14.9436 15.9834 15.0875 15.5803 15.0875 15.1269C15.0875 14.5601 14.8685 14.1035 14.4303 13.7571C13.9985 13.4107 13.2944 13.1179 12.318 12.8785L10.5906 12.4629C9.31375 12.1606 8.37492 11.726 7.77408 11.1592C7.17323 10.5924 6.8728 9.843 6.8728 8.91093C6.8728 8.1489 7.07935 7.47503 7.49243 6.88934C7.91177 6.29735 8.48758 5.83446 9.21987 5.50067C9.95215 5.16689 10.7908 5 11.7359 5C12.537 5 13.2662 5.12596 13.9234 5.37787C14.5868 5.62348 15.1376 5.96356 15.5757 6.39811C16.0138 6.83266 16.3049 7.33648 16.4488 7.90958C16.4676 7.98516 16.4801 8.06073 16.4864 8.1363C16.4989 8.20558 16.5051 8.27485 16.5051 8.34413C16.5051 8.57715 16.4332 8.76293 16.2892 8.90148C16.1515 9.03374 15.9606 9.09986 15.7165 9.09986C15.366 9.09986 15.1157 8.92353 14.9655 8.57085C14.809 8.1363 14.5806 7.76788 14.2801 7.46559C13.9797 7.15699 13.6136 6.92398 13.1817 6.76653C12.7561 6.60909 12.2742 6.53036 11.7359 6.53036C11.1351 6.53036 10.6031 6.62798 10.1399 6.82321C9.67676 7.01215 9.31062 7.27665 9.04149 7.61673C8.77862 7.95681 8.64718 8.34728 8.64718 8.78812C8.64718 9.31084 8.85998 9.73279 9.28558 10.054C9.71118 10.3752 10.4028 10.6523 11.3604 10.8853L12.8907 11.2537C14.2801 11.5812 15.2878 12.0283 15.9137 12.5951C16.5458 13.1619 16.8619 13.9366 16.8619 14.919C16.8619 15.7377 16.6491 16.4557 16.2235 17.0729C15.8042 17.6838 15.2127 18.1592 14.4491 18.4993C13.6855 18.8331 12.7843 19 11.7453 19ZM4.38492 12.2551C4.27852 12.2551 4.18776 12.2173 4.11266 12.1417C4.03755 12.0661 4 11.9748 4 11.8677C4 11.7607 4.03755 11.6694 4.11266 11.5938C4.18776 11.5182 4.27852 11.4804 4.38492 11.4804H19.1151C19.2215 11.4804 19.3122 11.5182 19.3873 11.5938C19.4624 11.6694 19.5 11.7607 19.5 11.8677C19.5 11.9748 19.4624 12.0661 19.3873 12.1417C19.3122 12.2173 19.2215 12.2551 19.1151 12.2551H4.38492Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function HorizontalRuleIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...rest}>
      <path d='M5 12H19' stroke='currentColor' strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M13.75 6.75L19.25 12L13.75 17.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M19 12H4.75'
      ></path>
    </svg>
  )
}

export function NewspaperIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M17.25 19.25H5.75C5.19772 19.25 4.75 18.8023 4.75 18.25V5.75C4.75 5.19771 5.19772 4.75 5.75 4.75H14.25C14.8023 4.75 15.25 5.19772 15.25 5.75V10'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M17.5227 9.75H15.25V17.25C15.25 18.3546 16.1454 19.25 17.25 19.25C18.3546 19.25 19.25 18.3546 19.25 17.25V11.4773C19.25 10.5233 18.4767 9.75 17.5227 9.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M7.75 8.75C7.75 8.19772 8.19772 7.75 8.75 7.75H11.25C11.8023 7.75 12.25 8.19772 12.25 8.75V10.25C12.25 10.8023 11.8023 11.25 11.25 11.25H8.75C8.19772 11.25 7.75 10.8023 7.75 10.25V8.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path d='M8 13.75H12' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
      <path d='M8 16.25H12' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
    </svg>
  )
}

export function NewspaperOffIcon(props: any) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15.7378 5.78732C15.8953 5.62983 15.9806 5.40539 15.9099 5.19419C15.6776 4.50016 15.0222 4 14.25 4H5.75C4.78351 4 4 4.78349 4 5.75V15.7145C4 16.3826 4.80786 16.7173 5.28033 16.2448V16.2448C5.42098 16.1041 5.5 15.9134 5.5 15.7145V5.75C5.5 5.61193 5.61193 5.5 5.75 5.5H14.25C14.3881 5.5 14.5 5.61192 14.5 5.75V5.75C14.5 6.22055 15.0689 6.45621 15.4017 6.12348L15.7378 5.78732ZM8.28554 18.5C8.08662 18.5 7.89586 18.579 7.75521 18.7197V18.7197C7.28273 19.1921 7.61736 20 8.28554 20H17.25C17.6642 20 18 19.6642 18 19.25C18 18.8358 17.6642 18.5 17.25 18.5H8.28554Z'
        fill='currentColor'
      />
      <path
        d='M17.7045 11.25H16V17.5658C16 18.496 16.6716 19.25 17.5 19.25C18.3284 19.25 19 18.496 19 17.5658V12.7046C19 11.9012 18.42 11.25 17.7045 11.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19.25 4.75L4.75 19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M4.75 8.75C4.75 7.64543 5.64543 6.75 6.75 6.75H17.25C18.3546 6.75 19.25 7.64543 19.25 8.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V8.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M8 4.75V8.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M16 4.75V8.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M7.75 10.75H16.25'
      ></path>
    </svg>
  )
}

export function SlackIcon(props: IconProps) {
  const { size = 24 } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_1841_4486)'>
        <path
          d='M5.13937 15.1181C5.13937 16.4977 4.02441 17.6126 2.64488 17.6126C1.26535 17.6126 0.150391 16.4977 0.150391 15.1181C0.150391 13.7386 1.26535 12.6237 2.64488 12.6237H5.13937V15.1181ZM6.38661 15.1181C6.38661 13.7386 7.50157 12.6237 8.8811 12.6237C10.2606 12.6237 11.3756 13.7386 11.3756 15.1181V21.3544C11.3756 22.7339 10.2606 23.8489 8.8811 23.8489C7.50157 23.8489 6.38661 22.7339 6.38661 21.3544V15.1181Z'
          fill='#E01E5A'
        />
        <path
          d='M8.88144 5.10238C7.50191 5.10238 6.38695 3.98742 6.38695 2.60789C6.38695 1.22836 7.50191 0.113403 8.88144 0.113403C10.261 0.113403 11.3759 1.22836 11.3759 2.60789V5.10238H8.88144ZM8.88144 6.36852C10.261 6.36852 11.3759 7.48348 11.3759 8.86301C11.3759 10.2425 10.261 11.3575 8.88144 11.3575H2.62632C1.2468 11.3575 0.131836 10.2425 0.131836 8.86301C0.131836 7.48348 1.2468 6.36852 2.62632 6.36852H8.88144Z'
          fill='#36C5F0'
        />
        <path
          d='M18.8788 8.86301C18.8788 7.48348 19.9938 6.36852 21.3733 6.36852C22.7528 6.36852 23.8678 7.48348 23.8678 8.86301C23.8678 10.2425 22.7528 11.3575 21.3733 11.3575H18.8788V8.86301ZM17.6316 8.86301C17.6316 10.2425 16.5166 11.3575 15.1371 11.3575C13.7575 11.3575 12.6426 10.2425 12.6426 8.86301V2.60789C12.6426 1.22836 13.7575 0.113403 15.1371 0.113403C16.5166 0.113403 17.6316 1.22836 17.6316 2.60789V8.86301V8.86301Z'
          fill='#2EB67D'
        />
        <path
          d='M15.1371 18.8599C16.5166 18.8599 17.6316 19.9748 17.6316 21.3544C17.6316 22.7339 16.5166 23.8489 15.1371 23.8489C13.7575 23.8489 12.6426 22.7339 12.6426 21.3544V18.8599H15.1371ZM15.1371 17.6126C13.7575 17.6126 12.6426 16.4977 12.6426 15.1181C12.6426 13.7386 13.7575 12.6237 15.1371 12.6237H21.3922C22.7717 12.6237 23.8867 13.7386 23.8867 15.1181C23.8867 16.4977 22.7717 17.6126 21.3922 17.6126H15.1371Z'
          fill='#ECB22E'
        />
      </g>
      <defs>
        <clipPath id='clip0_1841_4486'>
          <rect width='24' height='24' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export function GoogleCalendarIcon(props: IconProps) {
  const { size = 24 } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_1841_4477)'>
        <path d='M18.3161 5.6842H5.68457V18.3158H18.3161V5.6842Z' fill='white' />
        <path d='M18.3154 24L23.9996 18.3158H18.3154V24Z' fill='#EA4335' />
        <path d='M23.9996 5.6842H18.3154V18.3158H23.9996V5.6842Z' fill='#FBBC04' />
        <path d='M18.3161 18.3158H5.68457V24H18.3161V18.3158Z' fill='#34A853' />
        <path d='M0 18.3158V22.1053C0 23.1521 0.847895 24 1.89474 24H5.68421V18.3158H0Z' fill='#188038' />
        <path
          d='M23.9996 5.68421V1.89474C23.9996 0.847895 23.1517 0 22.1049 0H18.3154V5.68421H23.9996Z'
          fill='#1967D2'
        />
        <path
          d='M18.3158 0H1.89474C0.847895 0 0 0.847895 0 1.89474V18.3158H5.68421V5.68421H18.3158V0Z'
          fill='#4285F4'
        />
        <path
          d='M8.27522 15.4832C7.80312 15.1642 7.47627 14.6984 7.29785 14.0826L8.39364 13.6311C8.49312 14.01 8.6668 14.3037 8.91469 14.5121C9.16101 14.7205 9.46101 14.8232 9.81154 14.8232C10.17 14.8232 10.4779 14.7142 10.7352 14.4963C10.9926 14.2784 11.1221 14.0005 11.1221 13.6642C11.1221 13.32 10.9863 13.0389 10.7147 12.8211C10.4431 12.6032 10.1021 12.4942 9.69469 12.4942H9.06154V11.4095H9.62996C9.98048 11.4095 10.2757 11.3147 10.5157 11.1253C10.7557 10.9358 10.8757 10.6768 10.8757 10.3468C10.8757 10.0532 10.7684 9.81947 10.5536 9.64421C10.3389 9.46895 10.0673 9.38053 9.73733 9.38053C9.41522 9.38053 9.15943 9.46579 8.96996 9.63789C8.78061 9.81046 8.63825 10.0283 8.55627 10.2711L7.47154 9.81947C7.61522 9.4121 7.8789 9.0521 8.26575 8.74105C8.65259 8.43 9.1468 8.27368 9.7468 8.27368C10.1905 8.27368 10.59 8.35895 10.9436 8.53105C11.2973 8.70316 11.5752 8.94158 11.7757 9.24474C11.9763 9.54947 12.0757 9.89052 12.0757 10.2695C12.0757 10.6563 11.9826 10.9832 11.7963 11.2516C11.61 11.52 11.381 11.7253 11.1094 11.8689V11.9337C11.4601 12.0783 11.7647 12.3157 11.9905 12.6205C12.2194 12.9284 12.3347 13.2963 12.3347 13.7258C12.3347 14.1553 12.2257 14.5389 12.0078 14.8753C11.79 15.2116 11.4884 15.4768 11.1063 15.6695C10.7226 15.8621 10.2915 15.96 9.81311 15.96C9.2589 15.9616 8.74733 15.8021 8.27522 15.4832V15.4832ZM15.0063 10.0453L13.8031 10.9153L13.2015 10.0026L15.36 8.44579H16.1873V15.7895H15.0063V10.0453Z'
          fill='#4285F4'
        />
      </g>
      <defs>
        <clipPath id='clip0_1841_4477'>
          <rect width='24' height='24' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export function FigmaIcon() {
  return (
    <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6C10 7.10457 9.10457 8 8 8C6.89543 8 6 7.10457 6 6Z'
        fill='#1ABCFE'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2 10C2 8.89543 2.89543 8 4 8H6V10C6 11.1046 5.10457 12 4 12C2.89543 12 2 11.1046 2 10Z'
        fill='#0ACF83'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6 0V4H8C9.10457 4 10 3.10457 10 2C10 0.895431 9.10457 0 8 0H6Z'
        fill='#FF7262'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2 2C2 3.10457 2.89543 4 4 4H6V0H4C2.89543 0 2 0.895431 2 2Z'
        fill='#F24E1E'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2 6C2 7.10457 2.89543 8 4 8H6V4H4C2.89543 4 2 4.89543 2 6Z'
        fill='#A259FF'
      />
    </svg>
  )
}

export function FigmaOutlineIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.3774 5.2051H9.54076C8.52643 5.2051 7.70415 6.02736 7.70415 7.04167C7.70415 8.05598 8.52643 8.87825 9.54076 8.87825H11.3774V5.2051ZM11.3774 3.95996H12.6225H14.4592C16.1612 3.95996 17.5409 5.33968 17.5409 7.04167C17.5409 8.04605 17.0605 8.93821 16.3168 9.50081C17.0605 10.0634 17.5409 10.9556 17.5409 11.96C17.5409 13.6619 16.1612 15.0417 14.4592 15.0417C13.771 15.0417 13.1355 14.8161 12.6225 14.4349V15.0417V16.8783C12.6225 18.5802 11.2428 19.96 9.54076 19.96C7.83874 19.96 6.45898 18.5802 6.45898 16.8783C6.45898 15.8738 6.93947 14.9817 7.68313 14.4191C6.93947 13.8565 6.45898 12.9643 6.45898 11.96C6.45898 10.9556 6.93948 10.0634 7.68315 9.50083C6.93948 8.93821 6.45898 8.04605 6.45898 7.04167C6.45898 5.33968 7.83874 3.95996 9.54076 3.95996H11.3774ZM12.6225 5.2051V8.87825H14.4592C15.4735 8.87825 16.2957 8.05598 16.2957 7.04167C16.2957 6.02736 15.4735 5.2051 14.4592 5.2051H12.6225ZM9.54076 13.7965H11.3774V11.9647V11.96V11.9552V10.1234H9.54076C8.52643 10.1234 7.70415 10.9457 7.70415 11.96C7.70415 12.9719 8.52249 13.7926 9.53348 13.7965L9.54076 13.7965ZM7.70415 16.8783C7.70415 15.8663 8.52249 15.0456 9.53348 15.0417L9.54076 15.0417H11.3774V16.8783C11.3774 17.8925 10.5551 18.7148 9.54076 18.7148C8.52643 18.7148 7.70415 17.8925 7.70415 16.8783ZM12.6225 11.9563C12.6245 10.9437 13.446 10.1234 14.4592 10.1234C15.4735 10.1234 16.2957 10.9457 16.2957 11.96C16.2957 12.9743 15.4735 13.7965 14.4592 13.7965C13.446 13.7965 12.6245 12.9763 12.6225 11.9636V11.9563Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function ReplyIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M12.8 4.80005C15.6719 4.80005 18 7.19468 18 10.1486C18 13.1026 15.6719 15.4972 12.8 15.4972H6M6 15.4972L9.6 19.2M6 15.4972L9.6 11.7943'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function AccessIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15 13.25C17.3472 13.25 19.25 11.3472 19.25 9C19.25 6.65279 17.3472 4.75 15 4.75C12.6528 4.75 10.75 6.65279 10.75 9C10.75 9.31012 10.7832 9.61248 10.8463 9.90372L4.75 16V19.25H8L8.75 18.5V16.75H10.5L11.75 15.5V13.75H13.5L14.0963 13.1537C14.3875 13.2168 14.6899 13.25 15 13.25Z'
      ></path>
      <path
        stroke='currentColor'
        d='M16.5 8C16.5 8.27614 16.2761 8.5 16 8.5C15.7239 8.5 15.5 8.27614 15.5 8C15.5 7.72386 15.7239 7.5 16 7.5C16.2761 7.5 16.5 7.72386 16.5 8Z'
      ></path>
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M5.75 11.75C5.75 11.1977 6.19772 10.75 6.75 10.75H17.25C17.8023 10.75 18.25 11.1977 18.25 11.75V17.25C18.25 18.3546 17.3546 19.25 16.25 19.25H7.75C6.64543 19.25 5.75 18.3546 5.75 17.25V11.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M7.75 10.5V10.3427C7.75 8.78147 7.65607 7.04125 8.74646 5.9239C9.36829 5.2867 10.3745 4.75 12 4.75C13.6255 4.75 14.6317 5.2867 15.2535 5.9239C16.3439 7.04125 16.25 8.78147 16.25 10.3427V10.5'
      ></path>
    </svg>
  )
}

export function PlanetIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M17.25 12C17.25 14.8995 14.8995 17.25 12 17.25C9.10051 17.25 6.75 14.8995 6.75 12C6.75 9.10051 9.10051 6.75 12 6.75C14.8995 6.75 17.25 9.10051 17.25 12Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.5 13C14.5 13.2761 14.2761 13.5 14 13.5C13.7239 13.5 13.5 13.2761 13.5 13C13.5 12.7239 13.7239 12.5 14 12.5C14.2761 12.5 14.5 12.7239 14.5 13Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9.74036 7.02836C7.43859 5.28601 5.58836 4.43988 5.01552 5.01271C4.13772 5.89052 6.59194 9.76794 10.4972 13.6732C14.4024 17.5784 18.2799 20.0327 19.1577 19.1549C19.7443 18.5682 18.8428 16.6419 17.0145 14.2629'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function AnnouncementIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeWidth='1.5'
        d='M19.25 10C19.25 12.7289 17.85 15.25 16.5 15.25C15.15 15.25 13.75 12.7289 13.75 10C13.75 7.27106 15.15 4.75 16.5 4.75C17.85 4.75 19.25 7.27106 19.25 10Z'
      ></path>
      <path
        stroke='currentColor'
        strokeWidth='1.5'
        d='M16.5 15.25C16.5 15.25 8 13.5 7 13.25C6 13 4.75 11.6893 4.75 10C4.75 8.31066 6 7 7 6.75C8 6.5 16.5 4.75 16.5 4.75'
      ></path>
      <path
        stroke='currentColor'
        strokeWidth='1.5'
        d='M6.75 13.5V17.25C6.75 18.3546 7.64543 19.25 8.75 19.25H9.25C10.3546 19.25 11.25 18.3546 11.25 17.25V14.5'
      ></path>
    </svg>
  )
}

export function AnnouncementOffIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M14.5 10C14.5 8.75425 14.8217 7.5637 15.2803 6.70495C15.5097 6.27539 15.759 5.95579 15.9927 5.7527C16.0901 5.66807 16.1767 5.61029 16.2516 5.5716C16.2619 5.56629 16.273 5.56257 16.2843 5.56022V5.56022V5.56022C16.4634 5.52331 16.6538 5.51131 16.81 5.60631C16.8697 5.64261 16.9356 5.69037 17.0073 5.7527C17.241 5.95579 17.4903 6.27539 17.7197 6.70495C18.1783 7.5637 18.5 8.75425 18.5 10C18.5 11.2457 18.1783 12.4363 17.7197 13.295C17.6791 13.371 17.6379 13.4436 17.5963 13.5126C17.3857 13.8621 17.3899 14.3292 17.6784 14.6177V14.6177C17.9766 14.916 18.4649 14.9121 18.7031 14.564C18.8245 14.3866 18.9379 14.1981 19.0428 14.0016C19.6217 12.9176 20 11.4832 20 10C20 8.51681 19.6217 7.08236 19.0428 5.99835C18.7535 5.45652 18.3996 4.9753 17.9911 4.62041C17.5855 4.26797 17.0769 4 16.5 4V4C16.0403 4 15.5983 4.17023 15.1482 4.26319L15.0044 4.29287C14.1917 4.46089 13.0975 4.68754 11.972 4.92201C11.3207 5.0577 10.656 5.19662 10.0279 5.3286C9.44504 5.45109 9.23167 6.17101 9.65283 6.59217V6.59217C9.8323 6.77164 10.0902 6.84829 10.3386 6.79609C10.961 6.66531 11.6233 6.52688 12.278 6.39049V6.39049C12.9385 6.25288 13.5001 6.96768 13.3216 7.6183C13.1438 8.26638 13.0317 8.96554 13.0058 9.68129C12.9998 9.84645 13.066 10.0053 13.1829 10.1222L13.525 10.4644C13.8616 10.8009 14.5 10.4759 14.5 10V10ZM7.45992 6.52058C7.77557 6.83623 7.61497 7.36934 7.1819 7.47761V7.47761C6.8853 7.55176 6.45686 7.82031 6.09498 8.29186C5.74322 8.75022 5.5 9.3432 5.5 10C5.5 10.6568 5.74322 11.2498 6.09499 11.7081C6.45687 12.1797 6.88531 12.4482 7.1819 12.5224C7.66309 12.6427 10.016 13.1383 12.278 13.6095C12.6375 13.6844 12.9938 13.7585 13.3387 13.8301C13.5755 13.8793 13.7773 13.6488 13.6828 13.4261V13.4261C13.568 13.1554 13.8794 12.94 14.0873 13.148L16.6141 15.6748C16.7361 15.7967 16.6724 16 16.5 16V16V16C16.0403 16 15.5983 15.8298 15.1482 15.7368L15.0044 15.7071C14.7374 15.6519 14.44 15.5904 14.1211 15.5243C13.027 15.2977 12 16.1327 12 17.25V17.25C12 18.7688 10.7688 20 9.25 20H8.75C7.23122 20 6 18.7688 6 17.25V15.1165C6 14.1889 5.46978 13.3573 4.90501 12.6213V12.6213C4.38178 11.9395 4 11.0325 4 10C4 8.96746 4.38178 8.06044 4.90502 7.37864C5.41814 6.71002 6.1147 6.19824 6.8181 6.02239V6.02239C6.93905 5.99216 7.05861 6.06691 7.12854 6.17012C7.15487 6.20898 7.18525 6.24591 7.21967 6.28033L7.45992 6.52058ZM7.5 15.9876C7.5 15.0346 8.21672 14.2889 9.14909 14.4861V14.4861C9.84005 14.6323 10.5 15.2763 10.5 15.9825V17.25C10.5 17.9404 9.94039 18.5 9.25 18.5H8.75C8.05964 18.5 7.5 17.9404 7.5 17.25V15.9876Z'
        fill='currentColor'
      />
      <path
        d='M4.75 4.75L19.25 19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function MailIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 7.75C4.75 6.64543 5.64543 5.75 6.75 5.75H17.25C18.3546 5.75 19.25 6.64543 19.25 7.75V16.25C19.25 17.3546 18.3546 18.25 17.25 18.25H6.75C5.64543 18.25 4.75 17.3546 4.75 16.25V7.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M5.5 6.5L12 12.25L18.5 6.5'
      ></path>
    </svg>
  )
}

export function PlayIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        d='M18.1125 12.4381C18.4579 12.2481 18.4579 11.7519 18.1125 11.5619L8.74096 6.40753C8.40773 6.22425 8 6.46533 8 6.84564V17.1544C8 17.5347 8.40773 17.7757 8.74096 17.5925L18.1125 12.4381Z'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function PauseIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.5'
        d='M15.25 6.75V17.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.5'
        d='M8.75 6.75V17.25'
      ></path>
    </svg>
  )
}

export function LargePlayButton() {
  return (
    <svg width='38' height='43' viewBox='0 0 38 43' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M35.875 19.029C37.875 20.1837 37.875 23.0704 35.875 24.2251L4.875 42.123C2.875 43.2777 0.374998 41.8343 0.374998 39.5249L0.374998 3.72918C0.374998 1.41977 2.875 -0.0236048 4.875 1.1311L35.875 19.029Z'
        fill='white'
      />
    </svg>
  )
}

export function CopyIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M6.5 15.25V15.25C5.5335 15.25 4.75 14.4665 4.75 13.5V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H13.5C14.4665 4.75 15.25 5.5335 15.25 6.5V6.5'
      ></path>
      <rect
        width='10.5'
        height='10.5'
        x='8.75'
        y='8.75'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        rx='2'
      ></rect>
    </svg>
  )
}

export function AddCanvasCommentIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <mask id='path-1-inside-1_1_13' fill='white'>
        <path d='M4 12C4 7.58172 7.58172 4 12 4V4C16.4183 4 20 7.58172 20 12V12C20 16.4183 16.4183 20 12 20H5C4.44772 20 4 19.5523 4 19V12Z' />
      </mask>
      <path
        d='M4 12C4 7.58172 7.58172 4 12 4V4C16.4183 4 20 7.58172 20 12V12C20 16.4183 16.4183 20 12 20H5C4.44772 20 4 19.5523 4 19V12Z'
        stroke='currentColor'
        strokeWidth='3'
        mask='url(#path-1-inside-1_1_13)'
      />
      <path
        d='M12 9.5V11.75M12 11.75V14M12 11.75H14.5M12 11.75H9.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function TwoCheckmarksIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='m5.75 12.464 2.833 2.786c1.417-4.179 4.667-6.5 4.667-6.5m5 0s-4.25 2.321-5.667 6.5l-1.102-1.083'
      ></path>
    </svg>
  )
}

export function CircleFilterIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M12 20C10.9072 20 9.87712 19.7909 8.9098 19.3725C7.94771 18.9542 7.09804 18.3765 6.36078 17.6392C5.62353 16.902 5.04575 16.0523 4.62745 15.0902C4.20915 14.1229 4 13.0928 4 12C4 10.9072 4.20915 9.87974 4.62745 8.91765C5.04575 7.95033 5.62092 7.09804 6.35294 6.36078C7.0902 5.62353 7.93987 5.04575 8.90196 4.62745C9.86928 4.20915 10.8993 4 11.9922 4C13.085 4 14.115 4.20915 15.0824 4.62745C16.0497 5.04575 16.902 5.62353 17.6392 6.36078C18.3765 7.09804 18.9542 7.95033 19.3725 8.91765C19.7909 9.87974 20 10.9072 20 12C20 13.0928 19.7909 14.1229 19.3725 15.0902C18.9542 16.0523 18.3765 16.902 17.6392 17.6392C16.902 18.3765 16.0497 18.9542 15.0824 19.3725C14.1203 19.7909 13.0928 20 12 20ZM12 18.6667C12.9255 18.6667 13.7909 18.4941 14.5961 18.149C15.4013 17.8039 16.1098 17.3281 16.7216 16.7216C17.3333 16.1098 17.8092 15.4013 18.149 14.5961C18.4941 13.7909 18.6667 12.9255 18.6667 12C18.6667 11.0745 18.4941 10.2092 18.149 9.40392C17.8039 8.59869 17.3255 7.8902 16.7137 7.27843C16.1072 6.66667 15.3987 6.19085 14.5882 5.85098C13.783 5.50588 12.9176 5.33333 11.9922 5.33333C11.0667 5.33333 10.2013 5.50588 9.39608 5.85098C8.59085 6.19085 7.88497 6.66667 7.27843 7.27843C6.6719 7.8902 6.19608 8.59869 5.85098 9.40392C5.51111 10.2092 5.34118 11.0745 5.34118 12C5.34118 12.9255 5.51111 13.7909 5.85098 14.5961C6.19608 15.4013 6.6719 16.1098 7.27843 16.7216C7.8902 17.3281 8.59869 17.8039 9.40392 18.149C10.2092 18.4941 11.0745 18.6667 12 18.6667ZM7.73333 10.4471C7.56078 10.4471 7.41699 10.3974 7.30196 10.298C7.19216 10.1935 7.13726 10.0601 7.13726 9.89804C7.13726 9.73072 7.19216 9.59739 7.30196 9.49804C7.41699 9.39346 7.56078 9.34118 7.73333 9.34118H16.2824C16.4549 9.34118 16.5961 9.39346 16.7059 9.49804C16.8209 9.59739 16.8784 9.73072 16.8784 9.89804C16.8784 10.0601 16.8209 10.1935 16.7059 10.298C16.5961 10.3974 16.4549 10.4471 16.2824 10.4471H7.73333ZM8.89412 13.0431C8.72157 13.0431 8.57778 12.9935 8.46275 12.8941C8.35294 12.7948 8.29804 12.6614 8.29804 12.4941C8.29804 12.3268 8.35294 12.1935 8.46275 12.0941C8.57778 11.9895 8.72157 11.9373 8.89412 11.9373H15.1216C15.2941 11.9373 15.4353 11.9895 15.5451 12.0941C15.6601 12.1935 15.7176 12.3268 15.7176 12.4941C15.7176 12.6614 15.6601 12.7948 15.5451 12.8941C15.4353 12.9935 15.2941 13.0431 15.1216 13.0431H8.89412ZM10.1098 15.6471C9.93203 15.6471 9.78824 15.5974 9.67843 15.498C9.56863 15.3935 9.51373 15.2601 9.51373 15.098C9.51373 14.9307 9.56863 14.7974 9.67843 14.698C9.78824 14.5935 9.93203 14.5412 10.1098 14.5412H13.9137C14.0863 14.5412 14.2275 14.5935 14.3373 14.698C14.4471 14.7974 14.502 14.9307 14.502 15.098C14.502 15.2601 14.4471 15.3935 14.3373 15.498C14.2275 15.5974 14.0863 15.6471 13.9137 15.6471H10.1098Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function CircleFilterFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M12 20C10.9072 20 9.87712 19.7909 8.9098 19.3725C7.94771 18.9542 7.09804 18.3765 6.36078 17.6392C5.62353 16.902 5.04575 16.0523 4.62745 15.0902C4.20915 14.1229 4 13.0928 4 12C4 10.9072 4.20915 9.87974 4.62745 8.91765C5.04575 7.95033 5.62092 7.09804 6.35294 6.36078C7.0902 5.62353 7.93987 5.04575 8.90196 4.62745C9.86928 4.20915 10.8993 4 11.9922 4C13.085 4 14.115 4.20915 15.0824 4.62745C16.0497 5.04575 16.902 5.62353 17.6392 6.36078C18.3765 7.09804 18.9542 7.95033 19.3725 8.91765C19.7909 9.87974 20 10.9072 20 12C20 13.0928 19.7909 14.1229 19.3725 15.0902C18.9542 16.0523 18.3765 16.902 17.6392 17.6392C16.902 18.3765 16.0497 18.9542 15.0824 19.3725C14.1203 19.7909 13.0928 20 12 20ZM7.60784 10.3843H16.4235C16.6013 10.3843 16.7477 10.332 16.8627 10.2275C16.983 10.1229 17.0431 9.98693 17.0431 9.81961C17.0431 9.64706 16.983 9.5085 16.8627 9.40392C16.7477 9.29412 16.6013 9.23922 16.4235 9.23922H7.60784C7.43007 9.23922 7.28105 9.29412 7.16078 9.40392C7.04575 9.5085 6.98824 9.64706 6.98824 9.81961C6.98824 9.98693 7.04575 10.1229 7.16078 10.2275C7.28105 10.332 7.43007 10.3843 7.60784 10.3843ZM8.80784 13.0667H15.2235C15.4065 13.0667 15.5556 13.0144 15.6706 12.9098C15.7856 12.8052 15.8431 12.6667 15.8431 12.4941C15.8431 12.3216 15.7856 12.183 15.6706 12.0784C15.5556 11.9686 15.4065 11.9137 15.2235 11.9137H8.80784C8.62484 11.9137 8.47582 11.9686 8.36078 12.0784C8.24575 12.183 8.18824 12.3216 8.18824 12.4941C8.18824 12.6667 8.24575 12.8052 8.36078 12.9098C8.47582 13.0144 8.62484 13.0667 8.80784 13.0667ZM10.0627 15.749H13.9765C14.1542 15.749 14.3007 15.6967 14.4157 15.5922C14.5307 15.4876 14.5882 15.349 14.5882 15.1765C14.5882 15.0039 14.5307 14.8654 14.4157 14.7608C14.3007 14.6562 14.1542 14.6039 13.9765 14.6039H10.0627C9.87974 14.6039 9.73072 14.6562 9.61569 14.7608C9.50065 14.8654 9.44314 15.0039 9.44314 15.1765C9.44314 15.349 9.50065 15.4876 9.61569 15.5922C9.73072 15.6967 9.87974 15.749 10.0627 15.749Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function UnreadSquareBadgeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M19.2502 11V17.25C19.2502 18.3546 18.3548 19.25 17.2502 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H13'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='16' y='3' width='5' height='5' rx='2.5' fill='currentColor' />
    </svg>
  )
}

export function ReadSquareBadgeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M17.2502 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.2502C18.3548 4.75 19.2502 5.64543 19.2502 6.75V17.25C19.2502 18.3546 18.3548 19.25 17.2502 19.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M8.75 12L11 14.25L15.25 9.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function MarkAllReadIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M19.2502 10V6.75C19.2502 5.6454 18.3548 4.75 17.2502 4.75H6.75C5.64543 4.75 4.75 5.6454 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H7'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 16.714L11.833 19.5C13.25 15.321 16.5 13 16.5 13M21.5 13C21.5 13 17.25 15.321 15.833 19.5L14.731 18.417'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function DeleteAllReadIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M8.58363 19.25C7.54622 19.25 6.68102 18.4568 6.59115 17.4233L5.75 7.75H17.25L17 10.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M9.75 10.75V14' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M13.25 10.75V12.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.75 7.75V6.75C8.75 5.64543 9.64543 4.75 10.75 4.75H12.25C13.3546 4.75 14.25 5.64543 14.25 6.75V7.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M4.75 7.75H18.25' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M10.25 16.6212L12.5164 18.85C13.65 15.5068 16.25 13.65 16.25 13.65M20.25 13.65C20.25 13.65 16.85 15.5068 15.7164 18.85L14.8348 17.9836'
        stroke='currentColor'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function UsersIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M5.78168 19.25H13.2183C13.7828 19.25 14.227 18.7817 14.1145 18.2285C13.804 16.7012 12.7897 14 9.5 14C6.21031 14 5.19605 16.7012 4.88549 18.2285C4.773 18.7817 5.21718 19.25 5.78168 19.25Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.75 14C17.8288 14 18.6802 16.1479 19.0239 17.696C19.2095 18.532 18.5333 19.25 17.6769 19.25H16.75'
      ></path>
      <circle
        cx='9.5'
        cy='7.5'
        r='2.75'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M14.75 10.25C16.2688 10.25 17.25 9.01878 17.25 7.5C17.25 5.98122 16.2688 4.75 14.75 4.75'
      ></path>
    </svg>
  )
}

export function UploadCloudIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M6.25 14.25C6.25 14.25 4.75 14 4.75 12C4.75 10.2869 6.07542 8.88339 7.75672 8.75897C7.88168 6.5239 9.73368 4.75 12 4.75C14.2663 4.75 16.1183 6.5239 16.2433 8.75897C17.9246 8.88339 19.25 10.2869 19.25 12C19.25 14 17.75 14.25 17.75 14.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M14.25 15.25L12 12.75L9.75 15.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M12 19.25V13.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function MonitorIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V14.25C19.25 15.3546 18.3546 16.25 17.25 16.25H6.75C5.64543 16.25 4.75 15.3546 4.75 14.25V6.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.25 19.25L12 17.25L8.75 19.25'
      ></path>
    </svg>
  )
}

export function BoxIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 8L12 4.75L19.25 8L12 11.25L4.75 8Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 16L12 19.25L19.25 16'
      ></path>
      <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M19.25 8V16'></path>
      <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4.75 8V16'></path>
      <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 11.5V19'></path>
    </svg>
  )
}

export function BoxCheckIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='m5 8.12 6.25 3.38M5 8.12v7l6.25 3.38v-7M5 8.12 11.25 5l6.25 3.12m0 0v4.38m0-4.38-6.25 3.38M19.5 15s-1.929 2.09-2.893 4.5L15 17.571'
      ></path>
    </svg>
  )
}

export function ShieldLockIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M4.75 5.75C4.75 5.19771 5.19772 4.75 5.75 4.75H18.25C18.8023 4.75 19.25 5.19772 19.25 5.75V12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12V5.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M8.75 10.75V10C8.33579 10 8 10.3358 8 10.75H8.75ZM15.25 10.75H16C16 10.3358 15.6642 10 15.25 10V10.75ZM8.75 11.5H15.25V10H8.75V11.5ZM14.5 10.75V13.25H16V10.75H14.5ZM13.25 14.5H10.75V16H13.25V14.5ZM9.5 13.25V10.75H8V13.25H9.5ZM10.75 14.5C10.0596 14.5 9.5 13.9404 9.5 13.25H8C8 14.7688 9.23122 16 10.75 16V14.5ZM14.5 13.25C14.5 13.9404 13.9404 14.5 13.25 14.5V16C14.7688 16 16 14.7688 16 13.25H14.5Z'
        fill='currentColor'
      ></path>
      <path
        d='M9 10.5C9 10.9142 9.33579 11.25 9.75 11.25C10.1642 11.25 10.5 10.9142 10.5 10.5H9ZM13.5 10.5C13.5 10.9142 13.8358 11.25 14.25 11.25C14.6642 11.25 15 10.9142 15 10.5H13.5ZM10.5 10.5V9.75H9V10.5H10.5ZM11.75 8.5H12.25V7H11.75V8.5ZM13.5 9.75V10.5H15V9.75H13.5ZM12.25 8.5C12.9404 8.5 13.5 9.05964 13.5 9.75H15C15 8.23122 13.7688 7 12.25 7V8.5ZM10.5 9.75C10.5 9.05964 11.0596 8.5 11.75 8.5V7C10.2312 7 9 8.23122 9 9.75H10.5Z'
        fill='currentColor'
      ></path>
    </svg>
  )
}

export function HandLockIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M15 6.75C15 7.16421 15.3358 7.5 15.75 7.5C16.1642 7.5 16.5 7.16421 16.5 6.75H15ZM17.5 6.75C17.5 7.16421 17.8358 7.5 18.25 7.5C18.6642 7.5 19 7.16421 19 6.75H17.5ZM14.75 6.75V6C14.3358 6 14 6.33579 14 6.75H14.75ZM19.25 6.75H20C20 6.33579 19.6642 6 19.25 6V6.75ZM16.5 6.75V5.75H15V6.75H16.5ZM16.75 5.5H17.25V4H16.75V5.5ZM17.5 5.75V6.75H19V5.75H17.5ZM14 6.75V9.25H15.5V6.75H14ZM15.75 11H18.25V9.5H15.75V11ZM20 9.25V6.75H18.5V9.25H20ZM19.25 6H14.75V7.5H19.25V6ZM18.25 11C19.2165 11 20 10.2165 20 9.25H18.5C18.5 9.38807 18.3881 9.5 18.25 9.5V11ZM14 9.25C14 10.2165 14.7835 11 15.75 11V9.5C15.6119 9.5 15.5 9.38807 15.5 9.25H14ZM17.25 5.5C17.3881 5.5 17.5 5.61193 17.5 5.75H19C19 4.7835 18.2165 4 17.25 4V5.5ZM16.5 5.75C16.5 5.61193 16.6119 5.5 16.75 5.5V4C15.7835 4 15 4.7835 15 5.75H16.5Z'
        fill='currentColor'
      ></path>
      <path
        d='M7.25 14V12.75H4.75V19.25H7.25M7.25 14V19.25M7.25 14L10.0118 12.3853C10.657 11.9705 11.4078 11.75 12.1748 11.75H13.25V13M7.25 19.25C13.75 19.25 19.25 14.75 19.25 14.75V13H13.25M13.25 13V14L10.75 15.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function DoubleChatBubbleIcon(props: IconProps) {
  const { size = 20, strokeWidth = 1.5, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M9.99151 14.5101C12.7865 14.5101 15.233 12.9956 15.233 9.63003C15.233 6.26449 12.7865 4.75 9.99151 4.75C7.19653 4.75 4.75 6.26449 4.75 9.63003C4.75 10.8662 5.08005 11.8526 5.6362 12.606C5.83794 12.8793 5.79543 13.5163 5.63421 13.8153C5.24836 14.5309 5.97738 15.315 6.76977 15.1333C7.3629 14.9974 7.98504 14.8134 8.5295 14.5666C8.72883 14.4762 8.94893 14.4398 9.16641 14.4644C9.43657 14.4949 9.7123 14.5101 9.99151 14.5101Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M18.8088 10.0264C18.5473 9.70522 18.0748 9.65688 17.7537 9.91844C17.4325 10.18 17.3841 10.6524 17.6457 10.9736L18.8088 10.0264ZM18.3467 16.606L18.9501 17.0514L18.3467 16.606ZM15.4534 18.5666L15.1438 19.2497L15.1438 19.2497L15.4534 18.5666ZM17.2132 19.1333L17.3807 18.4023L17.3807 18.4023L17.2132 19.1333ZM14.8165 18.4644L14.9008 19.2096L14.9008 19.2096L14.8165 18.4644ZM10.9803 16.8944C10.6458 16.6501 10.1766 16.7231 9.93226 17.0575C9.6879 17.392 9.76093 17.8612 10.0954 18.1056L10.9803 16.8944ZM18.3487 17.8153L17.6886 18.1713L17.6886 18.1713L18.3487 17.8153ZM19.9829 13.63C19.9829 12.1584 19.5596 10.9483 18.8088 10.0264L17.6457 10.9736C18.151 11.5941 18.4829 12.4572 18.4829 13.63H19.9829ZM18.9501 17.0514C19.6137 16.1525 19.9829 15.0047 19.9829 13.63H18.4829C18.4829 14.7277 18.192 15.5527 17.7433 16.1606L18.9501 17.0514ZM15.1438 19.2497C15.7505 19.5247 16.4253 19.7222 17.0456 19.8644L17.3807 18.4023C16.8147 18.2725 16.2453 18.1021 15.7631 17.8835L15.1438 19.2497ZM13.9914 19.2601C14.2976 19.2601 14.6015 19.2435 14.9008 19.2096L14.7322 17.7191C14.4912 17.7464 14.2436 17.7601 13.9914 17.7601V19.2601ZM10.0954 18.1056C11.1905 18.9057 12.5779 19.2601 13.9914 19.2601V17.7601C12.8134 17.7601 11.759 17.4634 10.9803 16.8944L10.0954 18.1056ZM15.7631 17.8835C15.4442 17.739 15.0882 17.6789 14.7322 17.7191L14.9008 19.2096C14.9797 19.2007 15.064 19.2135 15.1438 19.2497L15.7631 17.8835ZM17.6886 18.1713C17.7076 18.2065 17.7058 18.2245 17.7043 18.2341C17.7019 18.2495 17.6921 18.2788 17.6617 18.3131C17.5963 18.3868 17.4894 18.4272 17.3807 18.4023L17.0456 19.8644C17.7293 20.0211 18.3831 19.7603 18.7839 19.3084C19.1945 18.8455 19.3725 18.1337 19.0089 17.4593L17.6886 18.1713ZM17.7433 16.1606C17.4917 16.5015 17.455 16.9378 17.4618 17.2191C17.4691 17.522 17.5335 17.8837 17.6886 18.1713L19.0089 17.4593C19.0109 17.4632 18.9979 17.4377 18.9842 17.3763C18.9716 17.3192 18.963 17.2514 18.9614 17.1829C18.9597 17.1133 18.9655 17.0587 18.9729 17.0242C18.9815 16.9836 18.9848 17.0045 18.9501 17.0514L17.7433 16.1606Z'
        fill='currentColor'
      ></path>
    </svg>
  )
}

export function ChartIcon(props: IconProps) {
  const { size = 20, strokeWidth = 1.5, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M4.75 6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M8.75 15.25V9.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M15.25 15.25V9.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M12 15.25V12.75'
      ></path>
    </svg>
  )
}

export function SignIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M10.75 13.25V19.25M10.75 4.75V6.75M4.75 7.75V12.25C4.75 12.8023 5.19772 13.25 5.75 13.25H16.25L19.25 10L16.25 6.75H5.75C5.19772 6.75 4.75 7.19772 4.75 7.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function PhotoIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L13 15.25M10.915 12.823C11.9522 11.5037 13.3973 9.63455 13.4914 9.51294C13.4947 9.50859 13.4979 9.50448 13.5013 9.50017C14.2815 8.51598 15.7663 8.48581 16.5856 9.43947L19 12.25M6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25Z'
      ></path>
    </svg>
  )
}

export function PhotoHideIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M4.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V12.25M19.25 12.25L16.5856 9.43947C15.7663 8.48581 14.2815 8.51598 13.5013 9.50017L13.4917 9.51251C13.4243 9.59962 12.612 10.6503 11.7732 11.7262M19.25 12.25V19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 16L7.25 12.75M4.75 16V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H14.25M4.75 16V9'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 4.75L19.25 19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function ArrowUpRightIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M17.25 15.25V6.75H8.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M17 7L6.75 17.25'
      ></path>
    </svg>
  )
}

export function ArrowUpLeftIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M6.75 15.25V6.75H15.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M7 7L17.25 17.25'
      ></path>
    </svg>
  )
}

export function WarningTriangleIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.9522 16.3536L10.2152 5.85658C10.9531 4.38481 13.0539 4.3852 13.7913 5.85723L19.0495 16.3543C19.7156 17.6841 18.7487 19.25 17.2613 19.25H6.74007C5.25234 19.25 4.2854 17.6835 4.9522 16.3536Z'
      ></path>
      <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 10V12'></path>
      <circle cx='12' cy='16' r='1' fill='currentColor'></circle>
    </svg>
  )
}

export function FilePlusIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M11.25 19.25H7.75C6.64543 19.25 5.75 18.3546 5.75 17.25V6.75C5.75 5.64543 6.64543 4.75 7.75 4.75H14L18.25 9V11.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M17 14.75V19.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M19.25 17L14.75 17'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M18 9.25H13.75V5'
      ></path>
    </svg>
  )
}

export function TextAlignLeftIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M4.75 5.75H14.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 18.25H14.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 12H19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function Heading1Icon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M5.75 7.75v8.5m5.5-8.5v8.5m-5.25-4h5m5.25 4v-8.5l-1.5 1.5m1.5 7h-1.5m1.5 0h2'
      ></path>
    </svg>
  )
}

export function Heading2Icon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M5.75 7.75v8.5m5.5-8.5v8.5m-5.25-4h5m7.25 4h-3.5v-.59a2 2 0 0 1 .456-1.272l2.588-3.142a2 2 0 0 0 .456-1.271V9.5a1.75 1.75 0 1 0-3.5 0v.212'
      ></path>
    </svg>
  )
}

export function Heading3Icon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M5.75 7.75v8.5m5.5-8.5v8.5m-5.25-4h5m4.913-.25h-.584m.584 0c1.29 0 2.337-.895 2.337-2v-.5c0-.966-.916-1.75-2.045-1.75-.57 0-1.084.2-1.455.52M15.913 12c1.29 0 2.337.895 2.337 2v.5c0 .966-.916 1.75-2.045 1.75-.57 0-1.084-.2-1.455-.52'
      ></path>
    </svg>
  )
}

export function OrderedListIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M7.25 9.25V5.75L5.75 6.25M7.25 9.25H5.75M7.25 9.25H8.25M8.25 18.25H5.75L7.977 16.212C8.10227 16.0976 8.19002 15.948 8.22871 15.7828C8.2674 15.6176 8.25522 15.4446 8.19378 15.2864C8.13235 15.1283 8.02452 14.9924 7.88446 14.8967C7.7444 14.801 7.57865 14.7498 7.409 14.75H6.25C6.11739 14.75 5.99021 14.8027 5.89645 14.8964C5.80268 14.9902 5.75 15.1174 5.75 15.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M11.75 8H18.25' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M11.75 16H18.25' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export function ChecklistIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M5.09961 7.82965L6.15843 8.92855L9.09961 6.07141'
        stroke='currentColor'
        strokeWidth='1.19048'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M5.09961 16.3297L6.15843 17.4286L9.09961 14.5714'
        stroke='currentColor'
        strokeWidth='1.19048'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M12 8H18.5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M12 16H18.5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export function CheckSquareIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M17.2502 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.2502C18.3548 4.75 19.2502 5.64543 19.2502 6.75V17.25C19.2502 18.3546 18.3548 19.25 17.2502 19.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M8.75 12L11 14.25L15.25 9.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function CodeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='m15.75 8.75 3.5 3.25-3.5 3.25m-7.5-6.5L4.75 12l3.5 3.25m5-9.5-2.5 12.5'
      ></path>
    </svg>
  )
}

export function RecordIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...rest}
    >
      <circle cx='12' cy='12' r='10' />
      <circle cx='12' cy='12' r='3' fill='currentColor' />
    </svg>
  )
}

export function SquareFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor' {...rest}>
      <path
        d='M17.2502 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.2502C18.3548 4.75 19.2502 5.64543 19.2502 6.75V17.25C19.2502 18.3546 18.3548 19.25 17.2502 19.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function StreamIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M7.25 17.25H6.75C5.64543 17.25 4.75 16.3546 4.75 15.25V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V9.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10.75 13.75C10.75 13.1977 11.1977 12.75 11.75 12.75H18.25C18.8023 12.75 19.25 13.1977 19.25 13.75V18.25C19.25 18.8023 18.8023 19.25 18.25 19.25H11.75C11.1977 19.25 10.75 18.8023 10.75 18.25V13.75Z'
        fill='white'
        fillOpacity='0.5'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function WindowOutIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M11.75 13.25L16.25 8.75M16.25 8.75H12.875M16.25 8.75V12.125M4.75 16.25V7.75C4.75 7.21957 4.96071 6.71086 5.33579 6.33579C5.71086 5.96071 6.21957 5.75 6.75 5.75H17.25C17.7804 5.75 18.2891 5.96071 18.6642 6.33579C19.0393 6.71086 19.25 7.21957 19.25 7.75V16.25C19.25 16.7804 19.0393 17.2891 18.6642 17.6642C18.2891 18.0393 17.7804 18.25 17.25 18.25H6.75C6.21957 18.25 5.71086 18.0393 5.33579 17.6642C4.96071 17.2891 4.75 16.7804 4.75 16.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function AspectRatioIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M7.75 11.25v-1.5a1 1 0 0 1 1-1h1.5m6 4v1.5a1 1 0 0 1-1 1h-1.5m-7 3h10.5a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H6.75a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2Z'
      ></path>
    </svg>
  )
}

export function PopInIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M16.25 12.75V14.25C16.25 14.5152 16.1446 14.7696 15.9571 14.9571C15.7696 15.1446 15.5152 15.25 15.25 15.25H13.75M6.75 18.25H17.25C17.7804 18.25 18.2891 18.0393 18.6642 17.6642C19.0393 17.2891 19.25 16.7804 19.25 16.25V7.75C19.25 7.21957 19.0393 6.71086 18.6642 6.33579C18.2891 5.96071 17.7804 5.75 17.25 5.75H6.75C6.21957 5.75 5.71086 5.96071 5.33579 6.33579C4.96071 6.71086 4.75 7.21957 4.75 7.75V16.25C4.75 16.7804 4.96071 17.2891 5.33579 17.6642C5.71086 18.0393 6.21957 18.25 6.75 18.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function PopOutIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M7.75 11.25V9.75C7.75 9.48478 7.85536 9.23043 8.04289 9.04289C8.23043 8.85536 8.48478 8.75 8.75 8.75H10.25M6.75 18.25H17.25C17.7804 18.25 18.2891 18.0393 18.6642 17.6642C19.0393 17.2891 19.25 16.7804 19.25 16.25V7.75C19.25 7.21957 19.0393 6.71086 18.6642 6.33579C18.2891 5.96071 17.7804 5.75 17.25 5.75H6.75C6.21957 5.75 5.71086 5.96071 5.33579 6.33579C4.96071 6.71086 4.75 7.21957 4.75 7.75V16.25C4.75 16.7804 4.96071 17.2891 5.33579 17.6642C5.71086 18.0393 6.21957 18.25 6.75 18.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function WindowInIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M16.25 8.75C14.4926 10.5074 11.75 13.25 11.75 13.25M11.75 13.25C13.068 13.25 13.807 13.25 15.125 13.25M11.75 13.25C11.75 11.932 11.75 11.193 11.75 9.875M4.75 16.25V7.75C4.75 7.21957 4.96071 6.71086 5.33579 6.33578C5.71086 5.96071 6.21957 5.75 6.75 5.75H17.25C17.7804 5.75 18.2891 5.96071 18.6642 6.33578C19.0393 6.71086 19.25 7.21957 19.25 7.75V16.25C19.25 16.7804 19.0393 17.2891 18.6642 17.6642C18.2891 18.0393 17.7804 18.25 17.25 18.25H6.75C6.21957 18.25 5.71086 18.0393 5.33579 17.6642C4.96071 17.2891 4.75 16.7804 4.75 16.25Z'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function BugIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
        d='M12 19.25v-3.5m0 3.5a4.25 4.25 0 0 1-4.249-4.157M12 19.25a4.25 4.25 0 0 0 4.249-4.157M4.75 7.75v1.326a2 2 0 0 0 1.065 1.768l2.069 1.095M19.25 7.75v1.326a2 2 0 0 1-1.065 1.768l-2.069 1.095M4.75 19.25v-1.645a2 2 0 0 1 1.298-1.873l1.703-.639M19.25 19.25v-1.645a2 2 0 0 0-1.298-1.873l-1.703-.639M9.75 7.25v-.5a2 2 0 0 1 2-2h.5a2 2 0 0 1 2 2v.5m-4.5 0v2m0-2-.894-.447a2 2 0 0 1-1.106-1.79V4.75m6.5 4.5v-2m0 0 .894-.447a2 2 0 0 0 1.106-1.79V4.75M7.751 15.093 7.75 15v-2c0-.367.046-.722.134-1.062m0 0a4.252 4.252 0 0 1 8.232 0m0 0c.088.34.134.695.134 1.062v2l-.001.093'
      />
    </svg>
  )
}

export function TextIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M18.25 7.25V5.75H5.75V7.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 6V18.25M12 18.25H10.75M12 18.25H13.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function SwitchIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M12.75 15.75L16 19.25L19.25 15.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 8.25L8 4.75L11.25 8.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M16 8.75V19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M8 4.75V15.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function SlidersIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 8H7.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M12.75 8H19.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M4.75 16H12.25'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M17.75 16H19.25'
      ></path>
      <circle
        cx='10'
        cy='8'
        r='2.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
      <circle
        cx='15'
        cy='16'
        r='2.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      ></circle>
    </svg>
  )
}

export function TextCapitalizeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M6 8.74584C6 7.99517 6.16375 7.33959 6.49126 6.77909C6.81877 6.21358 7.27778 5.77569 7.86828 5.46542C8.45879 5.15514 9.14854 5 9.93754 5H16.8078C17.0162 5 17.1824 5.06256 17.3065 5.18767C17.4355 5.30777 17.5 5.47292 17.5 5.68311C17.5 5.8933 17.4355 6.06345 17.3065 6.19357C17.1824 6.32368 17.0162 6.38874 16.8078 6.38874H15.5498V18.3094C15.5498 18.5196 15.4853 18.6872 15.3563 18.8123C15.2323 18.9374 15.0635 19 14.8502 19C14.6417 19 14.4755 18.9374 14.3515 18.8123C14.2324 18.6872 14.1728 18.5196 14.1728 18.3094V6.38874H12.5576V18.3094C12.5576 18.5196 12.4931 18.6872 12.3641 18.8123C12.24 18.9374 12.0738 19 11.8654 19C11.652 19 11.4833 18.9374 11.3592 18.8123C11.2401 18.6872 11.1806 18.5196 11.1806 18.3094V12.4992H9.97476C9.17584 12.4992 8.47864 12.3441 7.88317 12.0338C7.2877 11.7185 6.82373 11.2806 6.49126 10.7201C6.16375 10.1596 6 9.50152 6 8.74584Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function CodeBlockIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <rect
        width='14.5'
        height='14.5'
        x='4.75'
        y='4.75'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        rx='2'
      ></rect>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M8.75 10.75L11.25 13L8.75 15.25'
      ></path>
    </svg>
  )
}

export function LocationPinIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <svg width='24' height='24' fill='none' viewBox='0 0 24 24'>
        <path
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={strokeWidth}
          d='M18.25 11C18.25 15 12 19.25 12 19.25C12 19.25 5.75 15 5.75 11C5.75 7.5 8.68629 4.75 12 4.75C15.3137 4.75 18.25 7.5 18.25 11Z'
        ></path>
        <circle
          cx='12'
          cy='11'
          r='2.25'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={strokeWidth}
        ></circle>
      </svg>
    </svg>
  )
}

export function PinTackIcon(props: IconProps) {
  const { size = 20, strokeWidth = '1.5', ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M15.75 5.75L18.25 8.25M15.75 5.75L8 10M15.75 5.75L14.75 4.75M18.25 8.25L14 16M18.25 8.25L19.25 9.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M6.75 8.75L15.25 17.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M11 13L4.75 19.25'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}

export function PinTackFilledIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path d='M15.75 5.75L18.25 8.25L14 16L11 13L8 10L15.75 5.75Z' fill='currentColor' />
      <path
        d='M15.75 5.75L18.25 8.25M15.75 5.75L8 10L11 13M15.75 5.75L14.75 4.75M18.25 8.25L14 16L11 13M18.25 8.25L19.25 9.25M6.75 8.75L15.25 17.25M11 13L4.75 19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function Reply2Icon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M4.41361 10.2943C4.18785 10.0772 4.18785 9.71593 4.41361 9.49885L10.2383 3.8982C10.5889 3.56112 11.1724 3.80957 11.1724 4.2959V7.41379C11.1724 7.7185 11.4249 7.96454 11.7295 7.97423C18.1915 8.17992 19.6045 11.9938 19.9135 15.8407C19.963 16.4571 18.9202 16.6986 18.5668 16.1912C16.292 12.9257 13.0433 12.0986 11.7427 11.8935C11.4324 11.8445 11.1724 12.0897 11.1724 12.4038V15.4972C11.1724 15.9835 10.5889 16.232 10.2383 15.8949L4.41361 10.2943Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function BellBadgeIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M9 16.5C9 16.5 9 19.25 12 19.25C15 19.25 15 16.5 15 16.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 4.75C9.10051 4.75 6.75 7.10051 6.75 10V12L4.75 16.25H19.25L17.6089 12.75'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M22 6C22 8.20912 20.2091 10 18 10C15.7909 10 14 8.20912 14 6C14 3.79088 15.7909 2 18 2C20.2091 2 22 3.79088 22 6Z'
        fill='#3B82F6'
      />
    </svg>
  )
}

export function InboxArchiveIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M19.25 11.75C19.0042 10.8897 18.8012 10.1794 18.6071 9.5M4.75 11.75L6.33555 6.20056C6.58087 5.34196 7.36564 4.75 8.2586 4.75H12'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10.2142 12.3689C9.95611 12.0327 9.59467 11.75 9.17085 11.75H4.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V11.75H14.8291C14.4053 11.75 14.0439 12.0327 13.7858 12.3689C13.3745 12.9046 12.7276 13.25 12 13.25C11.2724 13.25 10.6255 12.9046 10.2142 12.3689Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M15.75 2.75L17.5 4.5M17.5 4.5L19.25 6.25M17.5 4.5L19.25 2.75M17.5 4.5L15.75 6.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function InboxUnarchiveIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} fill='none' viewBox='0 0 24 24' {...rest}>
      <path
        fill='currentColor'
        d='M12.75 4.75a.75.75 0 0 0-1.5 0h1.5Zm-.75 5.5-.557.502a.75.75 0 0 0 1.114 0L12 10.25Zm-1.693-3.002a.75.75 0 0 0-1.114 1.004l1.114-1.004Zm4.5 1.004a.75.75 0 1 0-1.114-1.004l1.114 1.004ZM11.25 4.75v5.5h1.5v-5.5h-1.5Zm1.307 4.998-2.25-2.5-1.114 1.004 2.25 2.5 1.114-1.004Zm0 1.004 2.25-2.5-1.114-1.004-2.25 2.5 1.114 1.004ZM9.75 13.75h.75a.75.75 0 0 0-.75-.75v.75Zm4.5 0V13a.75.75 0 0 0-.75.75h.75ZM7.187 6.57a.75.75 0 0 0-.374-1.452l.374 1.453Zm10-1.452a.75.75 0 1 0-.374 1.453l.374-1.453ZM16.25 18.5h-8.5V20h8.5v-1.5ZM5.5 16.25v-2.5H4v2.5h1.5Zm0-2.5v-5H4v5h1.5Zm-.75.75h5V13h-5v1.5ZM9 13.75v.5h1.5v-.5H9ZM11.75 17h.5v-1.5h-.5V17ZM15 14.25v-.5h-1.5v.5H15Zm5 2v-2.5h-1.5v2.5H20Zm-5.75-1.75h5V13h-5v1.5Zm5.75-.75v-5h-1.5v5H20ZM12.25 17A2.75 2.75 0 0 0 15 14.25h-1.5c0 .69-.56 1.25-1.25 1.25V17Zm-4.5 1.5a2.25 2.25 0 0 1-2.25-2.25H4A3.75 3.75 0 0 0 7.75 20v-1.5ZM9 14.25A2.75 2.75 0 0 0 11.75 17v-1.5c-.69 0-1.25-.56-1.25-1.25H9ZM16.25 20A3.75 3.75 0 0 0 20 16.25h-1.5a2.25 2.25 0 0 1-2.25 2.25V20ZM5.5 8.75c0-1.047.716-1.93 1.687-2.18l-.374-1.452A3.751 3.751 0 0 0 4 8.75h1.5Zm14.5 0a3.751 3.751 0 0 0-2.813-3.632l-.374 1.453A2.251 2.251 0 0 1 18.5 8.75H20Z'
      ></path>
    </svg>
  )
}

export function AppsIcon(props: IconProps) {
  const { size = 20, ...rest } = props

  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' {...rest}>
      <path
        d='M4.75 6.75V8.25C4.75 9.35457 5.64543 10.25 6.75 10.25H8.25C9.35457 10.25 10.25 9.35457 10.25 8.25V6.75C10.25 5.64543 9.35457 4.75 8.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M14.75 7H19.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M17 4.75L17 9.25'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M4.75 15.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H8.25C9.35457 19.25 10.25 18.3546 10.25 17.25V15.75C10.25 14.6454 9.35457 13.75 8.25 13.75H6.75C5.64543 13.75 4.75 14.6454 4.75 15.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M13.75 15.75V17.25C13.75 18.3546 14.6454 19.25 15.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V15.75C19.25 14.6454 18.3546 13.75 17.25 13.75H15.75C14.6454 13.75 13.75 14.6454 13.75 15.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  )
}
