import { useEffect, useRef } from 'react'
import { Selection as D3Selection, select } from 'd3-selection'
import { ZoomTransform } from 'd3-zoom'
import { useAtomValue } from 'jotai'

import { createTiles, filterVisibleTiles, getCurrentTransform, Tile } from '@/components/ZoomPane/utils'

import { zoomAtom } from './atom'

interface Props {
  width: number
  height: number
  src: string
  backgroundSrc: string
  style?: React.CSSProperties
}

interface ImageUrls {
  [url: string]:
    | {
        image: HTMLImageElement
        loaded: boolean
      }
    | undefined
}

// https://gist.github.com/callumlocke/cc258a193839691f60dd
function scaleCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, width: number, height: number) {
  // Handle window for SSR
  if (typeof window === 'undefined') return null

  // determine the actual ratio we want to draw at
  const ratio = window.devicePixelRatio || 1

  if (devicePixelRatio !== 1) {
    // set the 'real' canvas size to the higher width/height
    canvas.width = width * ratio
    canvas.height = height * ratio

    // ...then scale it back down with CSS
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
  } else {
    // this is a normal 1:1 device; just scale it simply
    canvas.width = width
    canvas.height = height
    canvas.style.width = ''
    canvas.style.height = ''
  }

  // scale the drawing context so everything will work at the higher ratio
  context.scale(ratio, ratio)
}

function scaleCanvasWithTransform(context: CanvasRenderingContext2D | null, transform: ZoomTransform) {
  context?.translate(transform.x, transform.y)
  context?.scale(transform.k, transform.k)
}

type DrawingCallback = 'none' | 'tile' | 'background'

export function ZoomCanvasTileRenderer({ width, height, src, backgroundSrc, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { d3Zoom, d3Container, viewport } = useAtomValue(zoomAtom)
  const d3Canvas = useRef<D3Selection<Element, unknown, null, undefined>>()
  const loaders = useRef<ImageUrls>({})
  const drawTile = useRef<(tile: Tile, callback: DrawingCallback) => void>()

  // keep the canvas in sync with the viewport
  useEffect(() => {
    if (viewport.width === 0 || viewport.height === 0) return

    const ctx = ref.current?.getContext('2d')

    if (ref.current && ctx) {
      scaleCanvas(ref.current, ctx, viewport.width, viewport.height)
    }

    if (d3Container && d3Zoom) {
      // this will end up drawing the canvas again
      d3Zoom.transform(d3Container, getCurrentTransform(d3Container))
    }
  }, [d3Container, d3Zoom, viewport.height, viewport.width])

  useEffect(() => {
    if (!d3Zoom || !d3Container || !ref.current) return

    // setup D3 containers
    d3Canvas.current = select(ref.current as Element)

    const ctx = ref.current?.getContext('2d')
    const tiles = createTiles(width, height, src)

    let lastTransform: ZoomTransform | null = null

    function fetchImage(src: string, tile: Tile, callback: DrawingCallback) {
      const image = new Image()

      loaders.current[src] = { image, loaded: false }

      image.onload = () => {
        loaders.current[src] = {
          image,
          loaded: true
        }
        drawTile.current?.(tile, callback)
        image.onload = null
      }
      image.src = src
    }

    drawTile.current = (tile: Tile, callback: DrawingCallback) => {
      if (!lastTransform) {
        return
      }

      const backgroundLoader = loaders.current[backgroundSrc]
      const tileLoader = loaders.current[tile.src]
      const canDrawBackground = !!backgroundLoader?.loaded
      const canDrawTile = !!tileLoader?.loaded
      const pushPopContext = callback !== 'none' && (canDrawBackground || canDrawTile)

      if (pushPopContext) {
        ctx?.save()
        scaleCanvasWithTransform(ctx, lastTransform)
      }

      if (backgroundLoader) {
        if (!canDrawTile && backgroundLoader.loaded && backgroundLoader.image) {
          if (callback === 'background') {
            ctx?.drawImage(backgroundLoader.image, 0, 0, width, height)
          } else {
            // rescale the background image to match the tile size
            const widthRatio = backgroundLoader.image.width / width
            const heightRatio = backgroundLoader.image.height / height

            ctx?.drawImage(
              backgroundLoader.image,
              tile.x * widthRatio,
              tile.y * heightRatio,
              tile.width * widthRatio,
              tile.height * heightRatio,
              tile.x,
              tile.y,
              tile.width,
              tile.height
            )
          }
        }
      } else {
        fetchImage(backgroundSrc, tile, 'background')
      }

      if (tileLoader) {
        if (tileLoader.image && tileLoader.loaded && ctx) {
          ctx?.drawImage(tileLoader.image, tile.x, tile.y, tile.width, tile.height)
        }
      } else {
        fetchImage(tile.src, tile, 'tile')
      }

      if (pushPopContext) {
        ctx?.restore()
      }
    }

    function updateContainerTransform(transform: ZoomTransform) {
      if (!ref.current) return

      lastTransform = transform

      const { width: containerWidth, height: containerHeight } = ref.current
      const visibleTiles = filterVisibleTiles({
        tiles,
        transform,
        width,
        height,
        containerWidth,
        containerHeight
      })

      ctx?.save()
      ctx?.clearRect(0, 0, containerWidth, containerHeight)
      scaleCanvasWithTransform(ctx, transform)
      visibleTiles.forEach((t) => drawTile.current?.(t, 'none'))
      ctx?.restore()
    }

    d3Zoom.on('zoom.svg', (event) => updateContainerTransform(event.transform))

    // initialize transforms immediately since the callback isn't called until interaction
    updateContainerTransform(getCurrentTransform(d3Container))
  }, [backgroundSrc, d3Container, d3Zoom, height, src, width])

  return <canvas ref={ref} style={style} />
}
