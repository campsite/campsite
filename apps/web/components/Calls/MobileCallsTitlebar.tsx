import { CallsIndexFilter } from '@/components/Calls/CallsIndexFilter'
import { BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'

export function MobileCallsTitlebar() {
  return (
    <BreadcrumbTitlebar className='flex h-auto py-1.5 lg:hidden'>
      <div className='flex flex-1 items-center gap-1'>
        <CallsIndexFilter fullWidth />
      </div>
    </BreadcrumbTitlebar>
  )
}
