import { useEffect, useRef } from 'react'
import { pointer, select } from 'd3-selection'
import { D3ZoomEvent, zoom } from 'd3-zoom'
import { useAtomValue, useSetAtom } from 'jotai'

import { setupZoomAtom, setZoomAtom, zoomAtom } from './atom'
import { useResizeHandler } from './useResizeHandler'
import {
  constrainedFitTransform,
  eventTargetClickDisabled,
  eventTargetWheelDisabled,
  getCurrentTransform
} from './utils'

export interface MediaCoordinates {
  x: number
  y: number
}

interface Props {
  width: number
  height: number
  minZoom?: number
  maxZoom?: number
  onClick?: (mediaCoords: MediaCoordinates | null, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  children: React.ReactNode
}

export function ZoomPane({ width, height, onClick, minZoom = 0.1, maxZoom = 8, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { d3Zoom, d3Container, transform } = useAtomValue(zoomAtom)
  const setInitialState = useSetAtom(setupZoomAtom)
  const setZoom = useSetAtom(setZoomAtom)

  // update viewport state on resizes
  useResizeHandler(containerRef)

  useEffect(() => {
    if (!containerRef.current) return

    const containerBox = containerRef.current.getBoundingClientRect()
    const d3ZoomInstance = zoom().scaleExtent([minZoom, maxZoom])
    const d3ContainerInstance = select(containerRef.current as Element).call(d3ZoomInstance)
    const initialTransform = constrainedFitTransform({
      d3Zoom: d3ZoomInstance,
      width,
      height,
      containerWidth: containerBox.width,
      containerHeight: containerBox.height,
      maxZoom: 1
    })

    // initialize zoom constrained to fit the container
    d3ZoomInstance.transform(d3ContainerInstance, initialTransform)

    d3ZoomInstance.on('zoom.pane', (event: D3ZoomEvent<HTMLDivElement, any>) => setZoom({ transform: event.transform }))

    d3ZoomInstance.filter((event: any) => {
      // disable the default double-click zoom behavior
      if (event.type === 'dblclick') {
        return false
      }

      if (event.type === 'mousedown' && eventTargetClickDisabled(event.target)) {
        return false
      }

      // disable right-click pans
      const buttonAllowed = !event.button || event.button < 2

      return buttonAllowed && (event.metaKey || event.ctrlKey || event.type !== 'wheel')
    })

    setInitialState({
      d3Zoom: d3ZoomInstance,
      d3Container: d3ContainerInstance,
      viewport: { ...containerBox },
      transform: initialTransform,
      size: { width, height }
    })
  }, [height, maxZoom, minZoom, setInitialState, setZoom, width])

  // keep panning state in sync
  useEffect(() => {
    if (!d3Zoom) return

    d3Zoom.on('start.pane', (event: D3ZoomEvent<HTMLDivElement, any>) => {
      if (!event.sourceEvent || event.sourceEvent.type !== 'mousedown') return
      setZoom({ panning: true })
    })

    d3Zoom.on('end.pane', (event: D3ZoomEvent<HTMLDivElement, any>) => {
      if (!event.sourceEvent) return
      setZoom({ panning: false })
    })
  }, [d3Zoom, setZoom])

  // convert wheel zoom events into pans to mimic Figma's zoom behavior
  // forked from https://github.com/wbkd/react-flow/blob/993a778b80cc1e80a47983ed75407b579313a73c/packages/core/src/container/ZoomPane/index.tsx#L113
  useEffect(() => {
    if (!d3Zoom || !d3Container) return

    d3Container.on(
      'wheel.pane',
      (event: any) => {
        if (eventTargetWheelDisabled(event.target)) return

        event.preventDefault()
        event.stopImmediatePropagation()

        const currentZoom = getCurrentTransform(d3Container)?.k || 1

        // handle pinch zoom of holding the command key
        if (event.ctrlKey || event.metaKey) {
          const point = pointer(event)
          // taken from https://github.com/d3/d3-zoom/blob/master/src/zoom.js
          const pinchDelta = -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * 10
          const zoom = currentZoom * Math.pow(2, pinchDelta)

          d3Zoom.scaleTo(d3Container, zoom, point)

          return
        }

        // increase scroll speed in firefox
        // firefox: deltaMode === 1; chrome: deltaMode === 0
        const deltaNormalize = event.deltaMode === 1 ? 20 : 1
        const deltaX = event.deltaX * deltaNormalize
        const deltaY = event.deltaY * deltaNormalize
        const panOnScrollSpeed = 0.5

        // Implement Y-axis scroll lock when Shift key is pressed
        if (event.shiftKey) {
          d3Zoom.translateBy(d3Container, 0, -(deltaY / currentZoom) * panOnScrollSpeed)
        } else {
          d3Zoom.translateBy(
            d3Container,
            -(deltaX / currentZoom) * panOnScrollSpeed,
            -(deltaY / currentZoom) * panOnScrollSpeed
          )
        }
      },
      { passive: false }
    )
  }, [d3Container, d3Zoom])

  // handle click events
  useEffect(() => {
    if (!d3Container) return

    d3Container.on('click.pane', (event: any) => {
      if (eventTargetClickDisabled(event.target)) return

      const point = pointer(event)
      const tx = (point[0] - transform.x) / transform.k
      const ty = (point[1] - transform.y) / transform.k

      event.preventDefault()
      event.stopImmediatePropagation()

      let mediaCoords: MediaCoordinates | null = null
      // only register clicks inside the media

      if (tx > 0 && tx < width && ty > 0 && ty < height) {
        mediaCoords = { x: tx, y: ty }
      }

      onClick?.(mediaCoords, event)
    })
  }, [d3Container, height, onClick, transform, width])

  return (
    <div ref={containerRef} className='zoom-pane relative h-full w-full overflow-clip'>
      {children}
    </div>
  )
}
