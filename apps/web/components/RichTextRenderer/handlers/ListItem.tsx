import { NodeHandler } from '.'

export const ListItem: NodeHandler = (props) => {
  return <li>{props.children}</li>
}
