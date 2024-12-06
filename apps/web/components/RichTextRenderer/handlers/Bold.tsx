import { NodeHandler } from '.'

export const Bold: NodeHandler = (props) => {
  return <strong>{props.children}</strong>
}
