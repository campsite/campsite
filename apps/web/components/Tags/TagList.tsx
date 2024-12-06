import { useMemo } from 'react'
import { InfiniteLoader } from 'components/InfiniteLoader'
import { useGetTags } from 'hooks/useGetTags'

import { Tag } from '@campsite/types'
import { HashtagIcon, Link, UIText } from '@campsite/ui'

import {
  IndexPageContainer,
  IndexPageContent,
  IndexPageEmptyState,
  IndexPageLoading
} from '@/components/IndexPages/components'
import { TagOverflowDropdown } from '@/components/Tags/OverflowDropdown'
import { TagBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useGetTag } from '@/hooks/useGetTag'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

export function TagsIndex() {
  const { scope } = useScope()
  const getTags = useGetTags({ query: '' })
  const tags = useMemo(() => flattenInfiniteData(getTags.data) || [], [getTags.data])
  const hasTags = tags.length > 0
  const isInitialLoading = getTags.isLoading

  return (
    <IndexPageContainer>
      <BreadcrumbTitlebar>
        <Link draggable={false} href={`/${scope}/tags`} className='flex items-center gap-3'>
          <TagBreadcrumbIcon />
          <BreadcrumbLabel>Tags</BreadcrumbLabel>
        </Link>
      </BreadcrumbTitlebar>

      <IndexPageContent>
        <div className='hidden lg:flex'></div>

        {isInitialLoading && <IndexPageLoading />}
        {!isInitialLoading && !hasTags && <TagsIndexEmptyState />}
        {!isInitialLoading && hasTags && <TagsList tags={tags} />}

        <InfiniteLoader
          hasNextPage={!!getTags.hasNextPage}
          isError={!!getTags.isError}
          isFetching={!!getTags.isFetching}
          isFetchingNextPage={!!getTags.isFetchingNextPage}
          fetchNextPage={getTags.fetchNextPage}
        />
      </IndexPageContent>
    </IndexPageContainer>
  )
}

function TagsIndexEmptyState() {
  return (
    <IndexPageEmptyState>
      <HashtagIcon size={32} />

      <div className='flex flex-col gap-1'>
        <UIText size='text-base' weight='font-semibold'>
          No tags yet
        </UIText>
      </div>
    </IndexPageEmptyState>
  )
}

function TagsList({ tags }: { tags: Tag[] }) {
  return (
    <ul className='flex flex-col py-2'>
      {tags.map((tag) => (
        <TagRow name={tag.name} key={tag.id} />
      ))}
    </ul>
  )
}

function TagRow({ name }: { name: string }) {
  const { data: tag } = useGetTag(name)

  if (!tag) return null
  return <InnerTagRow tag={tag} />
}

function InnerTagRow({ tag }: { tag: Tag }) {
  const { scope } = useScope()

  return (
    <li className='hover:bg-tertiary group-has-[button[aria-expanded="true"]]:bg-tertiary group relative -mx-3 flex items-center gap-3 rounded-md py-1.5 pl-3 pr-1.5'>
      <Link href={`/${scope}/tags/${tag.name}`} className='absolute inset-0 z-0' />

      <HashtagIcon className='text-quaternary' />

      <div className='flex flex-1 flex-row items-center gap-2'>
        <UIText weight='font-medium' size='text-[15px]' className='line-clamp-1'>
          {tag.name}
        </UIText>
        <UIText quaternary className='font-mono'>
          {tag.posts_count}
        </UIText>
      </div>

      <div className='hidden flex-none items-center gap-0.5 lg:flex'>
        <div className='flex opacity-0 group-hover:opacity-100 group-has-[button[aria-expanded="true"]]:opacity-100'>
          <TagOverflowDropdown tag={tag} />
        </div>
      </div>
    </li>
  )
}
