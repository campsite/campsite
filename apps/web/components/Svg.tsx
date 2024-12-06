import SVG from 'react-inlinesvg'

import { cn } from '@campsite/ui/src/utils'

interface Props {
  src: string
  alt?: string
  responsive?: boolean
}

export const Svg = ({ alt, responsive, src }: Props) => {
  var fileName = src.substring(0, src.lastIndexOf('.')) || src

  return (
    <SVG
      className={cn({ 'max-w-full': responsive })}
      height='100%'
      aria-label={alt}
      aria-hidden={!alt}
      src={`/images/${fileName}.svg`}
      uniquifyIDs
    />
  )
}
