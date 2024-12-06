import { MutableRefObject, useEffect } from 'react'
import { useSetAtom } from 'jotai'

import { setZoomAtom } from './atom'

// inspired by react-flow
// https://github.com/wbkd/react-flow/blob/993a778b80cc1e80a47983ed75407b579313a73c/packages/core/src/hooks/useResizeHandler.ts
export function useResizeHandler(rendererNode: MutableRefObject<HTMLDivElement | null>): void {
  const setZoom = useSetAtom(setZoomAtom)

  useEffect(() => {
    let resizeObserver: ResizeObserver
    const node = rendererNode.current

    const updateDimensions = () => {
      if (!node) return

      const size = { width: node.offsetWidth, height: node.offsetHeight }

      setZoom({ viewport: size })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    if (node) {
      resizeObserver = new ResizeObserver(() => updateDimensions())
      resizeObserver.observe(node)
    }

    return () => {
      window.removeEventListener('resize', updateDimensions)

      if (resizeObserver && node) {
        resizeObserver.unobserve(node!)
      }
    }
  }, [rendererNode, setZoom])
}
