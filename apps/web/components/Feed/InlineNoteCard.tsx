import { Post } from '@campsite/types'
import { Link } from '@campsite/ui/Link'

import { NoteCard } from '@/components/NoteCard'
import { useScope } from '@/contexts/scope'

interface Props {
  post: Post
}

export function InlineNoteCard({ post }: Props) {
  const { scope } = useScope()
  const noteUrl = `/${scope}/notes/${post.id}`

  return (
    <Link href={noteUrl} className='group block'>
      <NoteCard
        type='document'
        title={post.title || 'Untitled'}
        channel={post.project?.name}
      />
    </Link>
  )
}
