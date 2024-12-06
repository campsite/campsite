import { Selection as D3Selection } from 'd3-selection'
import { ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom'

const MIN_TILE_DIMENSION = 1024 * 4
const PREFERRED_TILE_DIMENSION = 1024 * 2

const preferredTileSize = (size: number) =>
  size < MIN_TILE_DIMENSION ? size : Math.ceil(size / Math.floor(size / PREFERRED_TILE_DIMENSION))

// window.devicePixelRatio will account for browser-zoom so prefer the visualViewport.scale if available
const screenPixelRatio = () => window.visualViewport?.scale ?? window.devicePixelRatio ?? 1

function tileUrl({ src, x, y, width, height }: { src: string; x: number; y: number; width: number; height: number }) {
  if (src.startsWith('data:')) return src

  const url = new URL(src)

  url.searchParams.set('dpr', screenPixelRatio().toString())
  url.searchParams.set('rect', `${x},${y},${width},${height}`)
  url.searchParams.set('w', `${width}`)
  url.searchParams.set('h', `${height}`)
  url.searchParams.set('auto', 'compress,format')

  return url.toString()
}

type CoordinateExtent = [[number, number], [number, number]]

const infiniteExtent: CoordinateExtent = [
  [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
]

export function constrainedFitTransform({
  d3Zoom,
  width,
  height,
  containerWidth,
  containerHeight,
  maxZoom
}: {
  d3Zoom: ZoomBehavior<Element, unknown>
  width: number
  height: number
  containerWidth: number
  containerHeight: number
  maxZoom?: number
}) {
  const extent: CoordinateExtent = [
    [0, 0],
    [containerWidth, containerHeight]
  ]
  const initialZoom = Math.min(Math.min(containerWidth / width, containerHeight / height), maxZoom ?? Infinity)
  const [minZoomExtent, maxZoomExtent] = d3Zoom.scaleExtent()
  const clampedZoom = clamp(initialZoom, minZoomExtent, maxZoom ?? maxZoomExtent)
  const translateX = (containerWidth - width * clampedZoom) * 0.5
  const translateY = (containerHeight - height * clampedZoom) * 0.5
  const updatedTransform = zoomIdentity.translate(translateX, translateY).scale(clampedZoom)

  return d3Zoom.constrain()(updatedTransform, extent, infiniteExtent)
}

export const clamp = (val: number, min = 0, max = 1): number => Math.min(Math.max(val, min), max)

export interface Tile {
  x: number
  y: number
  width: number
  height: number
  src: string
}

export function createTiles(width: number, height: number, src: string) {
  const srcURL = new URL(src)

  if (!srcURL.hostname.endsWith('imgix.net') && !srcURL.hostname.endsWith('imgix.com')) {
    return [{ x: 0, y: 0, width, height, src }]
  }

  const tiles: Tile[] = []
  const fixedTileWidth = preferredTileSize(width)
  const fixedTileHeight = preferredTileSize(height)
  const edgeBleedOverfetch = screenPixelRatio()

  for (let x = 0; x < width; x = x + fixedTileWidth) {
    for (let y = 0; y < height; y = y + fixedTileHeight) {
      const tileWidth = Math.min(fixedTileWidth + edgeBleedOverfetch, width - x)
      const tileHeight = Math.min(fixedTileHeight + edgeBleedOverfetch, height - y)

      tiles.push({
        x,
        y,
        width: tileWidth,
        height: tileHeight,
        src: tileUrl({ src, x, y, width: tileWidth, height: tileHeight })
      })
    }
  }

  return tiles
}

export function filterVisibleTiles({
  tiles,
  transform,
  width,
  height,
  containerWidth,
  containerHeight
}: {
  tiles: Tile[]
  transform: ZoomTransform
  width: number
  height: number
  containerWidth: number
  containerHeight: number
}) {
  const minX = Math.max(0, Math.floor(transform.invertX(0)))
  const minY = Math.max(0, Math.floor(transform.invertY(0)))
  const maxX = Math.min(width, Math.ceil(transform.invertX(containerWidth)))
  const maxY = Math.min(height, Math.ceil(transform.invertY(containerHeight)))

  return tiles.filter((tile) => {
    return tile.x + tile.width >= minX && tile.x <= maxX && tile.y + tile.height >= minY && tile.y <= maxY
  })
}

export const getCurrentTransform = (selection: D3Selection<Element, unknown, null, undefined>) =>
  selection.property('__zoom')

export const eventTargetClickDisabled = (target: HTMLElement) => target.closest('.zoom-pane [data-zoom-click-disabled]')

export const eventTargetWheelDisabled = (target: HTMLElement) => target.closest('.zoom-pane [data-zoom-wheel-disabled]')
