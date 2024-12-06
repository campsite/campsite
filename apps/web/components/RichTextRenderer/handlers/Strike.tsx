import { NodeHandler } from '.'

export const Strike: NodeHandler = (props) => {
  return <span className='line-through'>{props.children}</span>
}
