import { User } from '@campsite/types/generated'
import { Link, LinkProps } from '@campsite/ui/Link'

import { useScope } from '@/contexts/scope'

export function AuthorLink({
  user,
  children,
  ...linkProps
}: Omit<LinkProps, 'href'> & { user: User; children: React.ReactNode }) {
  const { scope } = useScope()

  // link is omitted until if/when integrations have profile pages
  if (user.integration) return <>{children}</>

  return (
    <Link {...linkProps} href={`/${scope}/people/${user.username}`}>
      {children}
    </Link>
  )
}
