import { PageContainer } from '@/components/Layouts/PageContainer'

import { Footer } from '../Footer'
import { SiteNavigationBar } from '../SiteNavigationBar'

interface Props {
  children: React.ReactNode
}

export function PageLayout({ children }: Props) {
  return (
    <div className='relative flex flex-1 flex-col'>
      <SiteNavigationBar />
      <PageContainer>{children}</PageContainer>
      {/* always push footer down */}
      <div className='flex-1' />
      <Footer />
    </div>
  )
}
