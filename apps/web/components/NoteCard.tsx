import { NoteIcon, UIText } from '@campsite/ui'
import { RelativeTime } from '@campsite/ui/RelativeTime'

interface NoteCardProps {
  title: string
  authorName?: string | null
  createdAt?: string | null
}

export function NoteCard({ title, authorName, createdAt }: NoteCardProps) {
  return (
    <div className='hover:bg-secondary flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors'>
      <div className='flex-none rounded-md border p-1.5'>
        <NoteIcon size={20} className='text-primary' />
      </div>

      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <UIText weight='font-medium' className='text-primary truncate text-[15px]'>
          {title || 'Untitled'}
        </UIText>

        {(authorName || createdAt) && (
          <span className='inline-flex items-center gap-1'>
            {authorName && (
              <UIText size='text-xs' tertiary>
                {authorName}
              </UIText>
            )}
            {authorName && createdAt && (
              <UIText size='text-xs' tertiary>
                &middot;
              </UIText>
            )}
            {createdAt && (
              <UIText size='text-xs' tertiary>
                <RelativeTime time={createdAt} />
              </UIText>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
