import { useRouter } from 'next/router'

import { AppLayout } from '@/components/Layout/AppLayout'
import { NoteView } from '@/components/NoteView'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { PageWithLayout } from '@/utils/types'

const NotePage: PageWithLayout<any> = () => {
  const router = useRouter()
  const noteId = (router.query?.noteId as string) ?? ''

  return <NoteView noteId={noteId} />
}

NotePage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default NotePage
