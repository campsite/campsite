/* eslint-disable @next/next/no-img-element */
import { NodeHandler } from '.'

export const Reaction: NodeHandler = ({ node }) => {
  if (node.attrs?.file_url) {
    return <img src={node.attrs.file_url} alt={node.attrs.name} data-type='reaction' />
  }

  return <span>{node.attrs?.native}</span>
}
