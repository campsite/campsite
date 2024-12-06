import React, { forwardRef, useEffect, useState } from 'react'

import { SITE_URL } from '@campsite/config'
import { ArrowUpRightIcon, Button, Link, ShipIcon, ShipUnreadIcon } from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'

import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetChangelog } from '@/hooks/useGetLatestRelease'
import { useStoredState } from '@/hooks/useStoredState'
import { Changelog } from '@/utils/types'

interface LinkProps {
  children: React.ReactNode
  href: string
  [key: string]: any
}

const SettingsLink = forwardRef((props: LinkProps, ref: React.ForwardedRef<HTMLAnchorElement>) => {
  let { href, children, ...rest } = props

  return (
    <Link href={href} ref={ref} {...rest}>
      {children}
    </Link>
  )
})

SettingsLink.displayName = 'SettingsLink'

export function ChangelogDropdown({
  side = 'top',
  align = 'start'
}: {
  side?: 'top' | 'bottom'
  align?: 'start' | 'end' | 'center'
}) {
  const { data: currentUser } = useGetCurrentUser()
  const { data: changelog } = useGetChangelog({ enabled: true })
  const [ls, setLs] = useStoredState<string[]>('seen-changelogs', [])
  const isUnread = (release: Changelog) => !ls.includes(release.slug)

  const [v2Ls] = useStoredState('latest-release-upsell-sidebar', '')
  const [hasUnread, setHasUnread] = useState(false)

  // mark as unread
  useEffect(() => {
    if (!changelog || changelog.length === 0) return

    // don't trigger unread dot for users who onboarded after the latest changelog was published
    const userOnboardedAfterLatestChangelog =
      currentUser?.onboarded_at && currentUser.onboarded_at > changelog[0].published_at

    if (userOnboardedAfterLatestChangelog) return

    const v2LsHasLatestRelease = v2Ls && v2Ls === changelog[0].slug

    if (v2LsHasLatestRelease) return

    // otherwise, mark it unread if the user hasn't seen the latest changelogs
    setHasUnread(changelog.some((c) => !ls.includes(c.slug)))
  }, [ls, changelog, currentUser, v2Ls])

  const trigger = (
    <Button
      iconOnly={hasUnread ? <ShipUnreadIcon /> : <ShipIcon />}
      variant='plain'
      href={`${SITE_URL}/changelog`}
      externalLink
      accessibilityLabel='Changelog'
      tooltip='Changelog'
      className='text-tertiary hover:text-primary'
    />
  )

  if (!changelog) {
    return (
      <Button
        iconOnly={<ShipIcon />}
        variant='plain'
        href={`${SITE_URL}/changelog`}
        externalLink
        accessibilityLabel='Changelog'
        tooltip='Changelog'
        className='text-tertiary hover:text-primary'
      />
    )
  }

  const items = buildMenuItems([
    ...buildMenuItems(
      changelog?.map((c) => ({
        type: 'item',
        label: c.title,
        rightSlot: isUnread(c) && <span className='bg-brand-primary h-1.5 w-1.5 flex-none rounded-full' />,
        url: `${SITE_URL}/changelog/${c.slug}`,
        external: true
      })) ?? []
    ),
    { type: 'separator' },
    {
      type: 'item',
      label: 'View all',
      rightSlot: <ArrowUpRightIcon />,
      url: `${SITE_URL}/changelog`,
      external: true
    }
  ])

  return (
    <DropdownMenu
      items={items}
      align={align}
      side={side}
      onOpenChange={() => {
        setLs(changelog.map((c) => c.slug))
        setHasUnread(false)
      }}
      trigger={trigger}
    />
  )
}
