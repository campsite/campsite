export interface ExportedNode {
  id: string
  type: 'PNG' | 'SVG'
  node_type: NodeType
  name: string
  bytes: Uint8Array
  width: number
  height: number
}

export function mime(node: ExportedNode): string {
  return node.type === 'PNG' ? 'image/png' : 'image/svg+xml'
}

export function src(node: ExportedNode): string {
  const base64 = btoa(
    Array(Object.keys(node.bytes).length)
      .fill('')
      .map((_, i) => String.fromCharCode(node.bytes[i]))
      .join('')
  )

  return `data:${mime(node)};base64,${base64}`
}

interface ExportPngOptions {
  type: 'PNG'
  scale: number
  maxSize?: number
}

interface ExportSvgOptions {
  type: 'SVG'
}

type ExportOptions = ExportPngOptions | ExportSvgOptions

/**
 * Exports the given node at the given scale (default 1)
 */
export async function exportNode(node: SceneNode, options: ExportOptions): Promise<ExportedNode> {
  let settings: ExportSettings

  let width = node.width
  let height = node.height

  switch (options.type) {
    case 'SVG':
      settings = {
        format: 'SVG',
        suffix: '@export'
      }
      break

    case 'PNG':
      let constraint: ExportSettingsConstraints | undefined = {
        type: 'SCALE',
        value: options.scale
      }

      if (options.maxSize) {
        if (node.width * options.scale > options.maxSize || node.height * options.scale > options.maxSize) {
          constraint = {
            type: node.width > node.height ? 'WIDTH' : 'HEIGHT',
            value: options.maxSize
          }

          if (node.width > node.height) {
            height *= options.maxSize / node.width
            width = options.maxSize
          } else {
            width *= options.maxSize / node.height
            height = options.maxSize
          }
        } else {
          constraint = undefined
        }
      } else {
        width *= options.scale
        height *= options.scale
      }

      settings = {
        format: 'PNG',
        suffix: '@export',
        constraint
      }
      break

    default:
      throw new Error(`Unknown export type.`)
  }

  const bytes = await node.exportAsync(settings)

  return {
    id: node.id,
    type: options.type,
    node_type: node.type,
    name: node.name,
    bytes,
    width,
    height
  }
}

export async function generatePreviews(nodes: readonly SceneNode[]) {
  return Promise.all(
    nodes.map((node) =>
      exportNode(node, {
        type: 'PNG',
        scale: 0.5,
        maxSize: 1024
      })
    )
  )
}
