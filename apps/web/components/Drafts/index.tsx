import { useMemo, useState } from 'react'

import { Post } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { Command, HighlightedCommandItem } from '@campsite/ui/Command'
import { PostIcon, TrashIcon } from '@campsite/ui/Icons'
import { Link } from '@campsite/ui/Link'
import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { DeleteDraftDialog } from '@/components/Drafts/DeleteDraftDialog'
import { DraftOverflowMenu } from '@/components/Drafts/DraftOverflowMenu'
import { FloatingNewPostButton } from '@/components/FloatingButtons/NewPost'
import { HTMLRenderer } from '@/components/HTMLRenderer'
import { IndexPageContainer, IndexPageContent, IndexPageEmptyState } from '@/components/IndexPages/components'
import { InfiniteLoader } from '@/components/InfiniteLoader'
import { PostComposerType, usePostComposer } from '@/components/PostComposer'
import { ProjectTag } from '@/components/ProjectTag'
import { DraftBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useGetPersonalDraftPosts } from '@/hooks/useGetPersonalDraftPosts'
import { encodeCommandListSubject } from '@/utils/commandListSubject'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { trimHtml } from '@/utils/trimHtml'

function DraftPostRow({ post }: { post: Post }) {
  const { showPostComposer } = usePostComposer()
  const isDescriptionEmpty = !trimHtml(post.description_html)
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)

  return (
    <>
      <DeleteDraftDialog post={post} open={deleteDialogIsOpen} onOpenChange={setDeleteDialogIsOpen} />

      <div
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5',
          isDescriptionEmpty ? 'items-center' : 'items-start'
        )}
      >
        <DraftOverflowMenu type='context' draftPost={post}>
          <HighlightedCommandItem
            className='absolute inset-0 z-0'
            value={encodeCommandListSubject(post)}
            onSelect={() => showPostComposer({ type: PostComposerType.EditDraftPost, post })}
          />
        </DraftOverflowMenu>

        <div className='flex flex-col flex-nowrap gap-0.5'>
          <UIText weight='font-medium' size='text-[15px]' className='break-anywhere line-clamp-1 max-w-lg'>
            {post.title || 'Untitled'}
          </UIText>
          {!isDescriptionEmpty && (
            <HTMLRenderer
              className={cn(
                'text-tertiary break-anywhere line-clamp-2 max-w-xl text-sm',
                // Override default markdown styles to keep preview styling minimal
                '[&_*]:!font-normal [&_*]:!not-italic [&_*]:![text-decoration-line:none] [&_*]:![text-decoration:none]'
              )}
              text={post.description_html}
            />
          )}
        </div>

        <span className='flex-1' aria-hidden />

        <div className='flex items-center gap-1'>
          {post.project && <ProjectTag className='max-sm:hidden' project={post.project} />}

          <Button
            iconOnly={<TrashIcon />}
            variant='plain'
            accessibilityLabel='Delete draft'
            onClick={() => setDeleteDialogIsOpen(true)}
            className='lg:opacity-0 lg:group-hover:opacity-100'
          />
        </div>
      </div>
    </>
  )
}

function DraftsList() {
  const { showPostComposer } = usePostComposer()
  const getPersonalDraftPosts = useGetPersonalDraftPosts()
  const draftPosts = useMemo(() => flattenInfiniteData(getPersonalDraftPosts.data) ?? [], [getPersonalDraftPosts.data])

  return (
    <>
      {!getPersonalDraftPosts.isLoading && !draftPosts.length && (
        <IndexPageEmptyState>
          <PostIcon size={32} />
          <div className='flex flex-col gap-1'>
            <UIText size='text-base' weight='font-semibold'>
              Start a new post
            </UIText>
            <UIText size='text-base' tertiary className='text-balance'>
              Your saved drafts will show up here to continue editing from anywhere.
            </UIText>
          </div>
          <Button onClick={() => showPostComposer()} variant='primary'>
            New post
          </Button>
        </IndexPageEmptyState>
      )}

      {!!draftPosts.length && (
        <Command disableAutoSelect focusSelection>
          <Command.List className='flex flex-1 flex-col gap-4 md:gap-6 lg:gap-8'>
            <div className='flex flex-col gap-px'>
              {draftPosts.map((post) => (
                <DraftPostRow key={post.id} post={post} />
              ))}
            </div>

            <InfiniteLoader
              hasNextPage={!!getPersonalDraftPosts.hasNextPage}
              isError={!!getPersonalDraftPosts.isError}
              isFetching={!!getPersonalDraftPosts.isFetching}
              isFetchingNextPage={!!getPersonalDraftPosts.isFetchingNextPage}
              fetchNextPage={getPersonalDraftPosts.fetchNextPage}
            />
          </Command.List>
        </Command>
      )}
    </>
  )
}

export function DraftsIndex() {
  const { scope } = useScope()

  return (
    <IndexPageContainer>
      <BreadcrumbTitlebar>
        <Link draggable={false} href={`/${scope}/drafts`} className='flex items-center gap-3'>
          <DraftBreadcrumbIcon />
          <BreadcrumbLabel>Drafts</BreadcrumbLabel>
        </Link>
      </BreadcrumbTitlebar>

      <IndexPageContent id='/[org]/drafts' className='@container'>
        <DraftsList />
      </IndexPageContent>

      <FloatingNewPostButton />
    </IndexPageContainer>
  )
}
