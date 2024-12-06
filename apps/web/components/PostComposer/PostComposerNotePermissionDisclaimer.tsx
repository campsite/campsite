import { useFormContext } from 'react-hook-form'

import { UIText } from '@campsite/ui'

import { PostSchema } from '@/components/Post/schema'
import { useGetNote } from '@/hooks/useGetNote'

interface PostComposerNotePermissionDisclaimerProps {
  noteId: string
}

export function PostComposerNotePermissionDisclaimer({ noteId }: PostComposerNotePermissionDisclaimerProps) {
  const methods = useFormContext<PostSchema>()
  const projectId = methods.watch('project_id')
  const { data: note } = useGetNote({ id: noteId })

  if (note?.project?.private && note?.project?.id !== projectId) {
    return (
      <div className='px-3'>
        <div className='flex items-start justify-center gap-2 rounded-lg bg-amber-50 p-2.5 text-center text-amber-900 dark:bg-amber-300/10 dark:text-amber-200'>
          <UIText inherit>
            People who haven&apos;t joined the private {note.project.name} channel won&apos;t be able to view this doc.
          </UIText>
        </div>
      </div>
    )
  }

  return null
}
