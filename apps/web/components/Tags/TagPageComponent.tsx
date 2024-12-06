import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

import { Tag } from '@campsite/types'
import { Link, UIText } from '@campsite/ui'

import { Feed } from '@/components/Feed'
import { setLastUsedPostFeedAtom } from '@/components/Post/PostNavigationButtons'
import { ScrollableContainer } from '@/components/ScrollableContainer'
import { TagOverflowDropdown } from '@/components/Tags/OverflowDropdown'
import { TagBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useGetTag } from '@/hooks/useGetTag'
import { useGetTagPosts } from '@/hooks/useGetTagPosts'

export function TagPageComponent() {
  const router = useRouter()
  const { scope } = useScope()
  const { tagName } = router.query
  const getTag = useGetTag(tagName as string)
  const tag = getTag.data as Tag
  const setLastUsedFeed = useSetAtom(setLastUsedPostFeedAtom)
  const getPosts = useGetTagPosts({ tagName: tagName as string })

  useEffect(() => {
    setLastUsedFeed({ type: 'tag', tagName: tagName as string })
  }, [tagName, setLastUsedFeed])

  if (!tag) return null

  return (
    <>
      <BreadcrumbTitlebar>
        <div className='flex flex-1 items-center gap-1.5'>
          <Link draggable={false} href={`/${scope}/tags`} className='flex items-center gap-3'>
            <TagBreadcrumbIcon />
            <BreadcrumbLabel>Tags</BreadcrumbLabel>
          </Link>
          <UIText quaternary>/</UIText>
          <BreadcrumbLabel>{tag.name}</BreadcrumbLabel>
        </div>

        <TagOverflowDropdown tag={tag} />
      </BreadcrumbTitlebar>

      <ScrollableContainer id='/[org]/tags/[tagName]'>
        <Feed isWriteableForViewer={false} getPosts={getPosts} />
      </ScrollableContainer>
    </>
  )
}
