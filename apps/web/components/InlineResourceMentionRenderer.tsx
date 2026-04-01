import { NodeViewWrapper, NodeViewWrapperProps } from '@tiptap/react'

import { parseCampsiteUrl } from '@campsite/editor'
import { VideoCameraFilledIcon, WarningTriangleIcon } from '@campsite/ui/Icons'
import { Link } from '@campsite/ui/Link'
import { LoadingSpinner } from '@campsite/ui/Spinner'
import { cn } from '@campsite/ui/src/utils'

import { NoteCard } from '@/components/NoteCard'
import { useRerenderNodeViewOnBlur } from '@/components/Post/Notes/useRerenderNodeViewOnBlur'
import { useGetNote } from '@/hooks/useGetNote'
import { useGetPost } from '@/hooks/useGetPost'

export function InlineResourceMentionRenderer(props: NodeViewWrapperProps) {
  const { href } = props.node.attrs
  const editor = props.editor

  useRerenderNodeViewOnBlur(editor)

  return (
    <NodeViewWrapper
      as='div'
      className={cn(
        'my-2',
        {
          'rounded-md outline outline-2 outline-blue-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500':
            props.editor.options.editable && props.selected && props.editor.isFocused
        },
        '[.drag-node_&]:outline-none'
      )}
      draggable={false}
      data-drag-handle={false}
    >
      <Link href={href}>
        <ResourceMentionView href={href} />
      </Link>
    </NodeViewWrapper>
  )
}

function Container({ children }: React.PropsWithChildren) {
  return (
    <span className='rounded bg-black/[0.04] decoration-clone py-0.5 pl-px pr-[3px] align-baseline text-[15px] hover:bg-black/[0.08] dark:bg-white/10 dark:hover:bg-white/[0.14]'>
      {children}
    </span>
  )
}

function IconContainer({ children }: React.PropsWithChildren) {
  return <span className='inline-flex h-[18px] items-center justify-center pr-1 align-text-bottom'>{children}</span>
}

/**
 * Fallback URL parser for campsite URLs when parseCampsiteUrl fails.
 * Handles both absolute and relative URLs by extracting subject and id from path segments.
 */
function fallbackParseCampsiteUrl(href: string): { subject: string; id: string } | null {
  if (!href) return null

  // Try to extract path from the href, handling both absolute and relative URLs
  let pathname: string

  try {
    const url = new URL(href, 'https://placeholder.com')

    pathname = url.pathname
  } catch {
    pathname = href
  }

  const segments = pathname.split('/').filter(Boolean)

  // Look for notes/posts/calls anywhere in the segments, take the next segment as ID
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]

    if ((seg === 'notes' || seg === 'posts' || seg === 'calls') && segments[i + 1]) {
      return { subject: seg, id: segments[i + 1] }
    }
  }

  return null
}

export function ResourceMentionView({ href }: { href: string }) {
  const parsed = parseCampsiteUrl(href) ?? fallbackParseCampsiteUrl(href)

  if (parsed?.subject === 'notes') {
    return <LinkedNotePreview noteId={parsed.id} />
  }

  if (parsed?.subject === 'posts') {
    return <LinkedPostPreview postId={parsed.id} />
  }

  if (parsed?.subject === 'calls') {
    return <CallPreview href={href} />
  }

  return (
    <Container>
      <IconContainer>
        <WarningTriangleIcon className='text-tertiary' />
      </IconContainer>
      <span className='text-tertiary'>Unable to show preview</span>
    </Container>
  )
}

function LinkedNotePreview({ noteId }: { noteId: string }) {
  const { data: note, isPending } = useGetNote({ id: noteId, enabled: true })

  if (isPending) {
    return (
      <Container>
        <IconContainer><LoadingSpinner /></IconContainer>
        <span className='text-tertiary'>Loading...</span>
      </Container>
    )
  }

  return (
    <NoteCard
      type='document'
      title={note?.title || 'Untitled'}
      channel={note?.project?.name}
    />
  )
}

function LinkedPostPreview({ postId }: { postId: string }) {
  const { data: post, isPending } = useGetPost({ postId, enabled: true })

  if (isPending) {
    return (
      <Container>
        <IconContainer><LoadingSpinner /></IconContainer>
        <span className='text-tertiary'>Loading...</span>
      </Container>
    )
  }

  return (
    <NoteCard
      type='post'
      title={post?.title || post?.truncated_description_text || 'Untitled'}
      channel={post?.project?.name}
    />
  )
}

function CallPreview(_props: { href: string }) {
  return (
    <Container>
      <IconContainer>
        <VideoCameraFilledIcon className='shrink-0 text-green-500' />
      </IconContainer>
      <span className='text-primary'>Call</span>
    </Container>
  )
}

export function ResourceMentionIcon({ type, size }: { type: 'call' | 'note' | 'post'; size?: number }) {
  if (type === 'call') {
    return <VideoCameraFilledIcon size={size} className='shrink-0 text-green-500' />
  }
  return null
}
