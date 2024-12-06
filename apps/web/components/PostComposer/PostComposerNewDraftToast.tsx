import { useEffect } from 'react'
import Router from 'next/router'

import { ToastWithLink } from '@campsite/ui/Toast'

import { useScope } from '@/contexts/scope'

export function PostComposerNewDraftToast() {
  const { scope } = useScope()

  useEffect(() => {
    Router.prefetch(`/${scope}/drafts`)
  }, [scope])

  return (
    <ToastWithLink url={`/${scope}/drafts`} hideCopyLink>
      Draft created
    </ToastWithLink>
  )
}
