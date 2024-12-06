import { NodeHandler } from '.'

export const Details: NodeHandler = ({ children }) => {
  return <details className='ml-4'>{children}</details>
}
