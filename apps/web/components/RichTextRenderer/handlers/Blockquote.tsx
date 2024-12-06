import { NodeHandler } from '.'

export const Blockquote: NodeHandler = (props) => {
  return <blockquote>{props.children}</blockquote>
}
