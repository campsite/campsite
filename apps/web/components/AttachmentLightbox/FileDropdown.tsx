import { Attachment, PostLink } from '@campsite/types'
import { Button, ContextMenu, DownloadIcon, ExternalLinkIcon, FigmaIcon } from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'

interface FileMenuProps extends React.PropsWithChildren {
  type: 'dropdown' | 'menu'
  attachment: Attachment
  links: PostLink[]
}

const openInFigmaLink = (links: PostLink[]) => links.find((link) => !!new URL(link.url)?.hostname.match(/figma.com/))

export function FileMenu({ children, type, attachment, links }: FileMenuProps) {
  const isDesktop = useIsDesktopApp()
  const figmaLink = attachment.file_type !== 'link' && openInFigmaLink(links)

  const items = buildMenuItems([
    {
      type: 'item',
      label: 'Download',
      url: attachment.download_url,
      download_as: attachment.name || 'file',
      rightSlot: <DownloadIcon />
    },
    {
      type: 'item',
      label: isDesktop ? 'Open in browser' : 'Open in new tab',
      url: attachment.url,
      external: true,
      rightSlot: <ExternalLinkIcon />
    },
    figmaLink && {
      type: 'item',
      label: 'Open in Figma',
      url: figmaLink.url,
      external: true,
      rightSlot: <FigmaIcon />
    }
  ])

  if (type === 'menu') {
    return <ContextMenu items={items}>{children}</ContextMenu>
  }

  return (
    <DropdownMenu
      align='start'
      items={items}
      disabled={items.length === 0}
      trigger={
        <Button variant='plain' disabled={items.length === 0}>
          File…
        </Button>
      }
    />
  )
}
