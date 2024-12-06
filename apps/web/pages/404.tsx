import { FullPageError } from '@/components/Error'
import { ScopeProvider } from '@/contexts/scope'

export default function NotFoundPage() {
  return (
    <ScopeProvider>
      <FullPageError
        title='Not found'
        emoji='🔎'
        message='What you are looking for could not be found — it may have moved or been deleted.'
      />
    </ScopeProvider>
  )
}
