import { Selection as D3Selection } from 'd3-selection'
import { ZoomBehavior, ZoomTransform } from 'd3-zoom'
import { atom } from 'jotai'

import { clamp, constrainedFitTransform } from './utils'

const TRANSITION_DURATION_MS = 300

interface ZoomState {
  d3Zoom: ZoomBehavior<Element, unknown> | null
  d3Container: D3Selection<Element, unknown, null, undefined> | null
  panning: boolean
  viewport: { width: number; height: number }
  size: { width: number; height: number }
  transform: ZoomTransform
}

const _zoomAtom = atom<ZoomState>({
  d3Zoom: null,
  d3Container: null,
  viewport: { width: 0, height: 0 },
  size: { width: 0, height: 0 },
  transform: new ZoomTransform(0, 0, 0),
  panning: false
})

export const zoomAtom = atom((get) => get(_zoomAtom))

export const setupZoomAtom = atom(null, (_get, set, state: Omit<ZoomState, 'panning'>) => {
  set(_zoomAtom, { panning: false, ...state })
})

export const setZoomAtom = atom(
  null,
  (_get, set, data: Partial<Pick<ZoomState, 'viewport' | 'size' | 'transform' | 'panning'>>) =>
    set(_zoomAtom, (prev) => ({ ...prev, ...data }))
)

export const panZoomAtom = atom(null, (_get, set, action: { x: number; y: number; behavior?: 'smooth' | 'auto' }) => {
  set(_zoomAtom, (prev) => {
    const { transform, d3Container, d3Zoom, viewport } = prev

    if (d3Container && d3Zoom) {
      const viewportX = action.x * transform.k + transform.x
      const viewportY = action.y * transform.k + transform.y

      const viewportPadding = 100 // provide 100px of space on all sides of the viewport
      const shouldPanX = viewportX < viewportPadding || viewportX > viewport.width - viewportPadding
      const shouldPanY = viewportY < viewportPadding || viewportY > viewport.height - viewportPadding

      if (shouldPanX || shouldPanY) {
        const x = clamp(viewportX, viewportPadding, viewport.width - viewportPadding)
        const y = clamp(viewportY, viewportPadding, viewport.height - viewportPadding)

        d3Container
          .transition()
          .duration(action.behavior === 'auto' ? 0 : TRANSITION_DURATION_MS)
          .call(d3Zoom.translateTo, action.x, action.y, [x, y])
      }
    }
    return prev
  })
})

export const changeZoomAtom = atom(
  null,
  (_get, set, action: 'zoom-50%' | 'zoom-100%' | 'zoom-fit' | 'zoom-in' | 'zoom-out') => {
    set(_zoomAtom, (prev) => {
      const { transform, d3Container, d3Zoom, viewport, size } = prev

      if (d3Container && d3Zoom) {
        switch (action) {
          case 'zoom-50%':
            d3Container.transition().duration(TRANSITION_DURATION_MS).call(d3Zoom.scaleTo, 0.5)
            break
          case 'zoom-100%':
            d3Container.transition().duration(TRANSITION_DURATION_MS).call(d3Zoom.scaleTo, 1)
            break
          case 'zoom-fit': {
            const newTransform = constrainedFitTransform({
              width: size.width,
              height: size.height,
              containerWidth: viewport.width,
              containerHeight: viewport.height,
              d3Zoom
            })

            d3Container.transition().duration(TRANSITION_DURATION_MS).call(d3Zoom.transform, newTransform)
            break
          }
          case 'zoom-in':
            d3Container
              .transition()
              .duration(TRANSITION_DURATION_MS)
              .call(d3Zoom.scaleTo, transform.k * 1.75)
            break
          case 'zoom-out':
            d3Container
              .transition()
              .duration(TRANSITION_DURATION_MS)
              .call(d3Zoom.scaleTo, transform.k * 0.6)
            break
        }
      }
      return prev
    })
  }
)
