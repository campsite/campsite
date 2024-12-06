import { Link } from '@campsite/ui'

import { useScope } from '@/contexts/scope'

type Props = {
  postId: string
  hash?: string
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href' | 'href'>

export function PostLink({ postId, hash, ...rest }: Props) {
  const { scope } = useScope()

  return <Link href={`/${scope}/posts/${postId}${hash ?? ''}`} {...rest} />
}
