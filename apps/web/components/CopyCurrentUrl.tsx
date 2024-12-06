import toast from 'react-hot-toast'

import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { useCopyToClipboard } from '@campsite/ui/hooks'

export function CopyCurrentUrl({ override }: { override?: string }) {
  const [copy] = useCopyToClipboard()

  return (
    <LayeredHotkeys
      keys={['mod+shift+c', 'mod+shift+comma']}
      callback={() => {
        const copyUrl = override || window.location.href

        copy(copyUrl)
        toast('Copied current URL to clipboard')
      }}
      options={{
        preventDefault: true,
        enableOnContentEditable: false,
        enabled: process.env.NODE_ENV !== 'development'
      }}
    />
  )
}
