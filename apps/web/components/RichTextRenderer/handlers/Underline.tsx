import { NodeHandler } from '.'

export const Underline: NodeHandler = (props) => {
  return <span className='underline'>{props.children}</span>
}
