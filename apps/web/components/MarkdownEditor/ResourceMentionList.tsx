import { ComponentPropsWithoutRef } from 'react'
import { Editor } from '@tiptap/core'
import { useAtomValue } from 'jotai'
import { useDebounce } from 'use-debounce'

import { ResourceMention } from '@campsite/editor'
import { Command, LoadingSpinner, RelativeTime, UIText } from '@campsite/ui'

import { useCallView } from '@/components/CallView'
import { ResourceMentionIcon } from '@/components/InlineResourceMentionRenderer'
import { useNoteView } from '@/components/NoteView'
import { usePostView } from '@/components/Post/PostView'
import { recentlyViewedAtom } from '@/components/Sidebar/RecentlyViewed/utils'
import { SuggestionItem, SuggestionRoot, useSuggestionQuery } from '@/components/SuggestionList'
import { useScope } from '@/contexts/scope'
import { useSearchResourceMentions } from '@/hooks/useSearchResourceMention'

type Props = Pick<ComponentPropsWithoutRef<typeof SuggestionRoot>, 'editor'> & {
  modal?: boolean
}

export function ResourceMentionList({ editor, modal }: Props) {
  return (
    <SuggestionRoot
      modal={modal}
      editor={editor}
      char='+'
      allow={({ state, range }) => {
        const $from = state.doc.resolve(range.from)
        const type = state.schema.nodes[ResourceMention.name]
        const allow = !!$from.parent.type.contentMatch.matchType(type)

        return allow
      }}
      allowSpaces
      minScore={0.2}
      contentClassName='p-0 max-h-[min(480px,var(--radix-popover-content-available-height))] w-[min(350px,var(--radix-popover-content-available-width))]'
      listClassName='divide-y-[0.5px] divide-gray-200 dark:divide-white/10'
    >
      <InnerResourceMentionList editor={editor} />
    </SuggestionRoot>
  )
}

function MentionListGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Command.Group
      className='p-1'
      heading={<UIText className='text-tertiary p-1.5 text-xs font-medium'>{label}</UIText>}
    >
      {children}
    </Command.Group>
  )
}

function InnerResourceMentionList({ editor }: Pick<Props, 'editor'>) {
  const query = useSuggestionQuery()
  const [debouncedQuery] = useDebounce(query, 50)
  const { data: results, isFetching } = useSearchResourceMentions({ query: debouncedQuery })

  // disallow self-mentions
  const postId = usePostView()
  const callId = useCallView()
  const noteId = useNoteView()
  const containedResourceId = postId || callId || noteId

  if (query) {
    if (isFetching && (!results || results.items.length === 0)) {
      return (
        <SuggestionItem
          editor={editor}
          value={query}
          className='text-tertiary pointer-events-none cursor-none select-none px-3'
          // eslint-disable-next-line no-empty-function
          onSelect={() => {}}
        >
          <LoadingSpinner />
          <span>Searching...</span>
        </SuggestionItem>
      )
    }

    const posts: ResourceMentionItemType[] = []
    const calls: ResourceMentionItemType[] = []
    const notes: ResourceMentionItemType[] = []

    results?.items?.forEach(({ item, project }) => {
      const resource = item.post || item.call || item.note

      if (!resource || resource.id === containedResourceId) return

      const resourceItem: ResourceMentionItemType = {
        id: resource.id,
        title: resource.title,
        url: resource.url,
        created_at: item.post && item.post.published_at ? item.post.published_at : resource.created_at,
        projectName: project?.name
      }

      if (item.post) {
        posts.push(resourceItem)
      } else if (item.call) {
        calls.push(resourceItem)
      } else if (item.note) {
        notes.push(resourceItem)
      }
    })

    return <ResourceMentionGroups editor={editor} posts={posts} calls={calls} notes={notes} />
  }

  return <DefaultResourceMentionList editor={editor} containedResourceId={containedResourceId} />
}

function DefaultResourceMentionList({
  editor,
  containedResourceId
}: Pick<Props, 'editor'> & { containedResourceId: string | null }) {
  const { scope } = useScope()
  const recentlyViewed = useAtomValue(recentlyViewedAtom(`${scope}`))

  const posts: ResourceMentionItemType[] = []
  const calls: ResourceMentionItemType[] = []
  const notes: ResourceMentionItemType[] = []

  recentlyViewed?.forEach(({ post, call, note }) => {
    const resource = post || call || note
    const id = resource?.id

    if (!resource?.url || !resource?.title || !id) return

    // exclude the currently-viewed resource if it exists
    if (containedResourceId && containedResourceId === id) return

    const resourceItem: ResourceMentionItemType = {
      id: resource.id,
      title: resource.title,
      url: resource.url,
      created_at: resource.created_at,
      projectName: resource.project?.name
    }

    if (post) {
      posts.push(resourceItem)
    } else if (call) {
      calls.push(resourceItem)
    } else if (note) {
      notes.push(resourceItem)
    }
  })

  return <ResourceMentionGroups editor={editor} posts={posts} calls={calls} notes={notes} />
}

interface ResourceMentionItemType {
  id: string
  title: string
  url: string
  created_at: string
  projectName: string | null | undefined
}

function ResourceMentionGroups({
  editor,
  posts,
  calls,
  notes
}: {
  editor: Editor
  posts: ResourceMentionItemType[]
  calls: ResourceMentionItemType[]
  notes: ResourceMentionItemType[]
}) {
  return (
    <>
      {posts.length > 0 && (
        <MentionListGroup label='Posts'>
          {posts.map((post) => (
            <ResourceMentionItem key={post.id} {...post} type='post' editor={editor} />
          ))}
        </MentionListGroup>
      )}
      {notes.length > 0 && (
        <MentionListGroup label='Docs'>
          {notes.map((note) => (
            <ResourceMentionItem key={note.id} {...note} type='note' editor={editor} />
          ))}
        </MentionListGroup>
      )}
      {calls.length > 0 && (
        <MentionListGroup label='Calls'>
          {calls.map((call) => (
            <ResourceMentionItem key={call.id} {...call} type='call' editor={editor} />
          ))}
        </MentionListGroup>
      )}
    </>
  )
}

function ResourceMentionItem({
  id,
  title,
  url,
  created_at,
  projectName,
  type,
  editor
}: ResourceMentionItemType & {
  type: 'call' | 'note' | 'post'
  editor: Editor
}) {
  return (
    <SuggestionItem
      editor={editor}
      key={id}
      value={id}
      keywords={[title ?? '']}
      onSelect={({ editor, range }) => editor.commands.insertResourceMention(url, range)}
      className='items-start'
    >
      <ResourceMentionIcon type={type} size={24} />
      <div className='flex min-w-0 flex-col'>
        <span className='overflow-hidden text-ellipsis whitespace-nowrap text-sm'>{title}</span>
        <span className='text-quaternary text-xs'>
          {projectName ?? 'Private'} <RelativeTime time={created_at} />
        </span>
      </div>
    </SuggestionItem>
  )
}
