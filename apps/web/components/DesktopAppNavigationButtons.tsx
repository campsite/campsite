import { useState } from 'react'
import { webContents } from '@todesktop/client-core'

import { Button, ChevronLeftIcon, ChevronRightIcon } from '@campsite/ui'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'

export function DesktopAppNavigationButtons() {
  const isDesktop = useIsDesktopApp()
  const [backDisabled, setBackDisabled] = useState(true)
  const [forwardDisabled, setForwardDisabled] = useState(true)

  if (!isDesktop) return null

  webContents.on('did-navigate-in-page', async () => {
    if (await webContents.canGoForward()) {
      setForwardDisabled(false)
    } else {
      setForwardDisabled(true)
    }

    if (await webContents.canGoBack()) {
      setBackDisabled(false)
    } else {
      setBackDisabled(true)
    }
  })

  function handleBack() {
    // @ts-ignore
    window.todesktop.contents.goBack()
  }

  function handleForward() {
    // @ts-ignore
    window.todesktop.contents.goForward()
  }

  return (
    <div className='drag flex items-center gap-0'>
      <Button
        disabled={backDisabled}
        onClick={handleBack}
        variant='plain'
        iconOnly={<ChevronLeftIcon size={24} />}
        accessibilityLabel='Back'
        tooltip='Back'
        tooltipShortcut='mod+['
      />
      <Button
        disabled={forwardDisabled}
        onClick={handleForward}
        variant='plain'
        iconOnly={<ChevronRightIcon size={24} />}
        accessibilityLabel='Forward'
        tooltip='Forward'
        tooltipShortcut='mod+]'
      />
    </div>
  )
}
