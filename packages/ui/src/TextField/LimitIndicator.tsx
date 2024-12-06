import { cn } from '../utils'

interface Props {
  maxLength: number
  currentLength: number
  charThreshold?: number
}
export function LimitIndicator({ maxLength, currentLength, charThreshold }: Props) {
  const radius = 5
  const strokeWidth = 2
  const indicatorTreshold = charThreshold ? charThreshold : maxLength * 0.2 // the number of characters left when indicator is shown
  const circumference = strokeWidth * Math.PI * radius
  const remainingChars = maxLength - currentLength
  const percent = remainingChars > 0 ? ((indicatorTreshold - remainingChars) / indicatorTreshold) * 100 : 100
  const dashOffset = circumference - (percent / 100) * circumference
  const tooManyCharacters = remainingChars <= 0
  const showIndicator = remainingChars <= indicatorTreshold

  if (!showIndicator) return null

  return (
    <div className='flex items-center gap-0.5'>
      <span
        className={cn('font-mono text-xs font-medium leading-none text-transparent', {
          'text-blue-500': showIndicator && !tooManyCharacters,
          'text-red-600': tooManyCharacters
        })}
      >
        {remainingChars}
      </span>
      <svg className='h-3.5 w-3.5'>
        <circle
          className='origin-center -rotate-90 text-gray-300 dark:text-gray-600'
          strokeWidth={strokeWidth}
          stroke='currentColor'
          fill='transparent'
          r={radius}
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
        />
        <circle
          className={cn('origin-center -rotate-90 text-blue-500', {
            'text-red-600': tooManyCharacters
          })}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap='round'
          stroke='currentColor'
          fill='transparent'
          r={radius}
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
        />
      </svg>
    </div>
  )
}
