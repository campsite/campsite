import { NodeHandler } from '.'

export const HorizontalRule: NodeHandler = () => {
  return (
    <div data-hr-wrapper='true'>
      <hr />
    </div>
  )
}
