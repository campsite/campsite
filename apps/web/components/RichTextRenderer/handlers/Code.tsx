import { NodeHandler } from '.'

export const Code: NodeHandler = (props) => {
  return <code>{props.children}</code>
}
