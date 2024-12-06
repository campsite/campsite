import { forwardRef } from 'react'
import { os } from '@todesktop/client-core/platform'
// eslint-disable-next-line no-restricted-imports
import NextLink from 'next/link'

import { WEB_URL } from '@campsite/config'

import { useIsDesktopApp } from '../hooks'
import { cn } from '../utils'
import { desktopJoinCall, linkType } from './utils'

export type LinkProps = React.ComponentProps<typeof NextLink> & {
  forceInternalLinksBlank?: boolean
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { className, onClick, href, forceInternalLinksBlank = false, ...rest } = props
  const classes = cn('callout-none', className)
  const isDesktopApp = useIsDesktopApp()
  const hrefString = props.href.toString()
  const type = linkType(hrefString)
  const desktopOnClickOverride =
    isDesktopApp && (type === 'call' || type === 'desktop_oauth' || type === 'public_share')
  const replaceInternalHref = !forceInternalLinksBlank && type === 'internal' && props.target === '_blank'
  const cleanedHref = replaceInternalHref ? hrefString.replace(WEB_URL, '') : href

  return (
    <NextLink
      {...rest}
      ref={ref}
      href={cleanedHref}
      className={classes}
      target={replaceInternalHref ? '_self' : props.target}
      onClick={(e) => {
        if (desktopOnClickOverride) {
          if (type === 'call') {
            desktopJoinCall(hrefString)
          } else if (type === 'desktop_oauth' || type === 'public_share') {
            os.openURL(hrefString)
          }

          e.preventDefault()
        } else if (isDesktopApp && forceInternalLinksBlank && props.target === '_blank') {
          /*
           * Ideally we'd use the normal link handling provided by our <Link> component.
           * Unfortunately, when we open a window programmatically with ToDesktop, like we do with calls,
           * those windows ignore the application "internal URL" settings, causing all links to open in
           * Desktop app windows. The safest thing to do until that bug is resolved is to open all links,
           * including internal links, in browser windows.
           *
           * https://campsite-software.slack.com/archives/C04R260LUMV/p1723751345237139
           */
          e.preventDefault()
          os.openURL(hrefString)
        }

        onClick?.(e)
      }}
    />
  )
})

Link.displayName = 'Link'
