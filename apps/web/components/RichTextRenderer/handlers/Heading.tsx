import { NodeHandler } from '.'

export const Heading: NodeHandler = (props) => {
  const level = String(props.node.attrs?.level || 1)

  switch (level) {
    case '1':
      return <h1>{props.children}</h1>
    case '2':
      return <h2>{props.children}</h2>
    case '3':
      return <h3>{props.children}</h3>
    case '4':
      return <h4>{props.children}</h4>
    case '5':
      return <h5>{props.children}</h5>
    case '6':
      return <h6>{props.children}</h6>
    default:
      return <h3>{props.children}</h3>
  }
}
