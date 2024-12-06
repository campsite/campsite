import { RichLinkCard } from '@/components/RichLinkCard'

import { NodeHandler } from '.'

export const LinkUnfurl: NodeHandler = (props) => {
  const { href } = props.node.attrs || {}

  return (
    <div className='mb-2.5'>
      <RichLinkCard url={href} className='not-prose max-w-full' display='slim' interactive />
    </div>
  )
}
