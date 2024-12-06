import { NodeHandler } from '.'

export const BulletList: NodeHandler = (props) => {
  return <ul>{props.children}</ul>
}
