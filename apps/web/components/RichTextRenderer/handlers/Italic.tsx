import { NodeHandler } from '.'

export const Italic: NodeHandler = (props) => {
  return <em>{props.children}</em>
}
