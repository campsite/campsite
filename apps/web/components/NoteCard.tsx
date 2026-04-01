import { NoteIcon, PostIcon, UIText } from '@campsite/ui'

interface NoteCardProps {
  title: string
  type: 'document' | 'post'
  channel?: string | null
}

export function NoteCard({ title, type, channel }: NoteCardProps) {
  return (
    <div className='hover:bg-secondary dark:hover:bg-secondary flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors'>
      {type === 'document' ? (
        <NoteIcon size={18} className='text-secondary flex-none' />
      ) : (
        <PostIcon size={18} className='text-secondary flex-none' />
      )}

      <div className='flex min-w-0 flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1'>
        <UIText weight='font-medium' className='text-primary truncate text-[15px]'>
          {title || 'Untitled'}
        </UIText>

        <span className='inline-flex flex-wrap items-center gap-1.5'>
          <Pill>{type === 'document' ? 'Document' : 'Post'}</Pill>
          {channel && <Pill>{channel}</Pill>}
        </span>
      </div>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className='bg-tertiary dark:bg-quaternary inline-flex items-center rounded px-1.5 py-0.5'>
      <UIText size='text-xs' className='text-secondary'>
        {children}
      </UIText>
    </span>
  )
}
