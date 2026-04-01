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
      as='span'
      className={cn(
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

export function ResourceMentionView({ href }: { href: string }) {
  const parsed = parseCampsiteUrl(href)

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
