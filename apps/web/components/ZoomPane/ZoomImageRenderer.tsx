import { useEffect, useRef } from 'react'
import { ZoomTransform } from 'd3-zoom'
import { useAtomValue } from 'jotai'
import Image from 'next/image'

import { zoomAtom } from '@/components/ZoomPane/atom'
import { getCurrentTransform } from '@/components/ZoomPane/utils'

interface Props {
  width: number
  height: number
  src: string
  style?: React.CSSProperties
}

export function ZoomImageRenderer({ width, height, src, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { d3Zoom, d3Container } = useAtomValue(zoomAtom)

  useEffect(() => {
    if (!d3Zoom || !d3Container) return

    function updateContainerTransform(transform: ZoomTransform) {
      if (!containerRef.current) return

      containerRef.current.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`
    }

    d3Zoom.on('zoom.image', (event) => updateContainerTransform(event.transform))

    // initialize transforms immediately since the callback isn't called until interaction
    updateContainerTransform(getCurrentTransform(d3Container))
  }, [d3Container, d3Zoom])

  return (
    <div
      ref={containerRef}
      className='absolute block origin-top-left'
      style={{ top: 0, left: 0, width, height, ...style }}
    >
      <Image width={width} height={height} src={src} alt='Canvas image' priority />
    </div>
  )
}
