import { useScope } from '@/contexts/scope'

export function useInboxFilterHrefs() {
  const { scope } = useScope()
  const updatesHref = `/${scope}/inbox/updates`
  const archivedHref = `/${scope}/inbox/archived`
  const laterHref = `/${scope}/inbox/later`
  const activityHref = `/${scope}/inbox/activity`

  return { scope, updatesHref, archivedHref, laterHref, activityHref }
}
