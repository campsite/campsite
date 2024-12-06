import Head from 'next/head'

import { Avatar } from '@campsite/ui/Avatar'
import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

export function Container({ children }: React.PropsWithChildren) {
  return (
    <div className='overflow-y-auto px-4 py-4 md:px-0 md:py-0'>
      <div className='mx-auto flex max-w-[28rem] flex-1 flex-col gap-4 md:py-16'>{children}</div>
    </div>
  )
}

export function Form({ className, ...rest }: React.ComponentPropsWithoutRef<'form'>) {
  return <form className={cn('flex flex-col gap-4', className)} {...rest} />
}

export function Title({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-2'>
      <h2 className='text-2xl font-bold'>{title}</h2>
      <UIText tertiary>{subtitle}</UIText>
    </div>
  )
}

export function OrgAvatar() {
  const { data: org } = useGetCurrentOrganization()

  if (!org) return null

  return (
    <div className='-mt-10 flex items-center gap-2'>
      <Avatar urls={org.avatar_urls} size='sm' rounded='rounded' />
      <UIText weight='font-medium'>{org.name}</UIText>
    </div>
  )
}

export function HeadOrgName() {
  const { data: org } = useGetCurrentOrganization()

  if (!org) return null

  return (
    <Head>
      <title>{org.name}</title>
    </Head>
  )
}
