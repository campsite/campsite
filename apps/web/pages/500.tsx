import { FullPageError } from '@/components/Error'
import { ScopeProvider } from '@/contexts/scope'

export default function InternalErrorPage({ message = 'We ran into an issue starting the app' }: { message: string }) {
  return (
    <ScopeProvider>
      <FullPageError message={message} />
    </ScopeProvider>
  )
}
