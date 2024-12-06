import { useEffect, useRef } from 'react'
import { ZoomTransform } from 'd3-zoom'
import { useAtomValue } from 'jotai'

import { zoomAtom } from '@/components/ZoomPane/atom'
import { getCurrentTransform } from '@/components/ZoomPane/utils'

export interface Annotation {
  id: string
  x: number
  y: number
}

interface Props<T> {
  annotations: T[]
  getNode: (annotation: T) => React.ReactNode
}

export function ZoomAnnotationsOverlay<T extends Annotation>({ annotations, getNode }: Props<T>) {
  const { d3Zoom, d3Container, transform } = useAtomValue(zoomAtom)
  const annotationRefs = useRef<{ [id: string]: HTMLElement | null }>({})

  useEffect(() => {
    if (!d3Zoom || !d3Container) return

    function updateCommentPositions(transform: ZoomTransform) {
      annotations.forEach(({ x, y, id }) => {
        const ref = annotationRefs.current[id]

        if (!ref) return

        ref.style.left = `${x * transform.k + transform.x}px`
        ref.style.top = `${y * transform.k + transform.y}px`
      })
    }

    d3Zoom.on('zoom.comments', (event) => updateCommentPositions(event.transform))

    updateCommentPositions(getCurrentTransform(d3Container))
  }, [annotations, d3Container, d3Zoom])

  // don't render anything until there is a valid transform to avoid shifting annotations
  if (transform.k === 0) return null

  return (
    <>
      {annotations.map((annotation) => (
        <div
          className='absolute'
          key={annotation.id}
          ref={(ref) => {
            annotationRefs.current[annotation.id] = ref
          }}
          data-zoom-click-disabled
        >
          {getNode(annotation)}
        </div>
      ))}
    </>
  )
}
