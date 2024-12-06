import { NodeHandler } from '.'

export const TaskList: NodeHandler = (props) => {
  return <ul className='task-list'>{props.children}</ul>
}
