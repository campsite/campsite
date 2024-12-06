import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { PostVersion } from '@campsite/types'
import { Button, CheckIcon, Link, LinkIcon, PostIcon, UIText } from '@campsite/ui'
import { useCopyToClipboard } from '@campsite/ui/src/hooks'

import { FullPageError } from '@/components/Error'
import { FullPageLoading } from '@/components/FullPageLoading'
import { InlinePost } from '@/components/InlinePost'
import { PostComposerType, usePostComposer } from '@/components/PostComposer'
import { ScrollableContainer } from '@/components/ScrollableContainer'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useGetPost } from '@/hooks/useGetPost'
import { useGetPostVersions } from '@/hooks/useGetPostVersions'

export function PostVersionsFeed() {
  const router = useRouter()
  const { postId } = router.query
  const getPost = useGetPost({ postId: postId as string })
  const getVersions = useGetPostVersions(postId as string, { enabled: !!postId })

  const rootPost = getPost.data
  const postVersions = getVersions.data
  const isLoading = getPost.isLoading || getVersions.isLoading

  if (isLoading) {
    return <FullPageLoading />
  }

  if (!postId || !rootPost) {
    return (
      <FullPageError message='We couldn’t find this post, it may have been deleted or moved to a private channel.' />
    )
  }

  if (!rootPost.viewer_is_organization_member) {
    return <FullPageError message='Members of this organization can view the full version history of this post.' />
  }

  const versions = !postVersions || postVersions.length === 0 ? [rootPost] : [...postVersions]

  return <VersionsFeed versions={versions} />
}

function VersionsFeed({ versions }: { versions: PostVersion[] }) {
  const router = useRouter()
  const { scope } = useScope()
  const { showPostComposer } = usePostComposer()
  const routerPostId = router.query.postId as string
  const [copy, isCopied] = useCopyToClipboard()
  const latestVersionId = versions.at(0)?.id
  const getLatestPost = useGetPost({ postId: latestVersionId })
  const latestPost = getLatestPost.data
  const sortedVersions = versions.sort((a, b) => b.version - a.version)

  const showNewVersionAction = latestPost && latestPost.viewer_is_author
  const newVersionActionDisabled = !latestPost

  function handleNewVersion() {
    if (newVersionActionDisabled) return

    showPostComposer({ type: PostComposerType.DraftFromPost, post: latestPost })
  }

  return (
    <>
      <BreadcrumbTitlebar>
        <div className='flex flex-1 items-center gap-1.5'>
          <Link draggable={false} href={`/${scope}/posts/${routerPostId}`} className='flex items-center gap-3'>
            <PostIcon size={24} />
            <BreadcrumbLabel>Post</BreadcrumbLabel>
          </Link>

          <UIText quaternary>/</UIText>

          <BreadcrumbLabel>Versions</BreadcrumbLabel>
        </div>

        <div className='flex items-center gap-1.5'>
          <Button
            iconOnly={isCopied ? <CheckIcon /> : <LinkIcon />}
            accessibilityLabel='Copy link'
            variant='plain'
            onClick={() => {
              copy(`${latestPost?.url}/versions`)
              toast('Copied to clipboard')
            }}
          />

          {showNewVersionAction && (
            <Button disabled={newVersionActionDisabled} onClick={handleNewVersion} variant='flat'>
              New version
            </Button>
          )}
        </div>
      </BreadcrumbTitlebar>
      <ScrollableContainer>
        <div className='mx-auto flex w-full max-w-[--feed-width] flex-col gap-5 px-4 py-4 md:py-6 lg:py-8'>
          {sortedVersions.map((version) => (
            <FetchingInlinePost key={version.id} postId={version.id} />
          ))}
        </div>
      </ScrollableContainer>
    </>
  )
}

function FetchingInlinePost({ postId }: { postId: string }) {
  const { data: post } = useGetPost({ postId })

  if (!post) return null
  return <InlinePost post={post} />
}
