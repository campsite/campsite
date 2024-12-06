import { NodeHandler } from '.'

export const DetailsSummary: NodeHandler = ({ children }) => {
  return (
    <summary className='cursor-pointer list-outside'>
      <span className='ml-1 font-bold'>{children}</span>
    </summary>
  )
}
