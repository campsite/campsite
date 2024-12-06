import { NodeHandler } from '.'

export const Paragraph: NodeHandler = ({ node, children }) => {
  let style: React.CSSProperties = {}

  if (node.attrs?.textAlign) {
    style.textAlign = node.attrs.textAlign
  }

  return <p style={style}>{children}</p>
}
