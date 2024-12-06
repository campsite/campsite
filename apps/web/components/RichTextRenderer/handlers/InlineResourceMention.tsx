import { ResourceMentionOptions } from '@campsite/editor'
import { Link } from '@campsite/ui/Link'

import { ResourceMentionView } from '@/components/InlineResourceMentionRenderer'

import { NodeHandler } from '.'

export const InlineResourceMention: NodeHandler<ResourceMentionOptions> = ({ node }) => {
  const href = node.attrs?.href

  return (
    <Link href={href}>
      <ResourceMentionView href={href} />
    </Link>
  )
}
