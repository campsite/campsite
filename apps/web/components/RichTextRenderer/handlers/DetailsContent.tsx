import { NodeHandler } from '.'

export const DetailsContent: NodeHandler = ({ children }) => {
  return <div className='ml-1 mt-1'>{children}</div>
}
