import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtomValue } from 'jotai'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useInView } from 'react-intersection-observer'

import { IS_PRODUCTION } from '@campsite/config/index'
import { BlurAtTopOptions } from '@campsite/editor/extensions'
import { Post } from '@campsite/types'
import { Button } from '@campsite/ui/Button'
import { BugIcon } from '@campsite/ui/Icons'
import { cn, isMetaEnter } from '@campsite/ui/src/utils'
import { UIText } from '@campsite/ui/Text'

import { EMPTY_HTML } from '@/atoms/markdown'
import MarkdownEditor, { MarkdownEditorRef } from '@/components/MarkdownEditor'
import { getPostSchemaDefaultValues, PostSchema, postSchema } from '@/components/Post/schema'
import { useDefaultComposerValues } from '@/components/PostComposer/hooks/useDefaultComposerValues'
import { useFormSetValue } from '@/components/PostComposer/hooks/useFormSetValue'
import { usePostComposerCreatePost } from '@/components/PostComposer/hooks/usePostComposerCreatePost'
import { usePostComposerLocalDraftActions } from '@/components/PostComposer/hooks/usePostComposerLocalDraft'
import { usePostComposerUpdatePost } from '@/components/PostComposer/hooks/usePostComposerUpdatePost'
import { PostComposerActions } from '@/components/PostComposer/PostComposerActions'
import { PostComposerFeedback } from '@/components/PostComposer/PostComposerFeedback'
import { PostComposerHeaderActions } from '@/components/PostComposer/PostComposerHeaderActions'
import { PostComposerInteractiveAttachments } from '@/components/PostComposer/PostComposerInteractiveAttachments'
import { PostComposerNotePermissionDisclaimer } from '@/components/PostComposer/PostComposerNotePermissionDisclaimer'
import { PostComposerPolls } from '@/components/PostComposer/PostComposerPolls'
import { PostComposerProjectPicker } from '@/components/PostComposer/PostComposerProjectPicker'
import { PostComposerUnfurledLink } from '@/components/PostComposer/PostComposerUnfurledLink'
import {
  getSubmitButtonId,
  PostComposerAction,
  postComposerStateAtom,
  PostComposerType
} from '@/components/PostComposer/utils'
import { TitleTextField } from '@/components/TitleTextField'
import { useCreatePostPublication } from '@/hooks/useCreatePostPublication'
import { useGetProjectMembers } from '@/hooks/useGetProjectMembers'
import { useUploadHelpers } from '@/hooks/useUploadHelpers'
import { hasOptimisticAttachments } from '@/utils/createFileUploadPipeline'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

export interface InlineComposerRef {
  isDirty: boolean
}

export const PostComposerFormProvider = forwardRef<InlineComposerRef, React.PropsWithChildren>(function InlineComposer(
  { children },
  ref
) {
  const { defaultValues } = useAtomValue(postComposerStateAtom) ?? {}
  const methods = useForm<PostSchema>({ resolver: zodResolver(postSchema), defaultValues })
  const isDirty = methods.formState.isDirty

  useImperativeHandle(ref, () => ({ isDirty }), [isDirty])

  return <FormProvider {...methods}>{children}</FormProvider>
})

interface ComposerFormProps {
  onSubmit?: (
    data: { type: 'new-post'; post: Post } | { type: 'update-post' } | { type: 'draft-post'; post: Post }
  ) => void
  onReportBug?(text?: string): void
  onDeleteDraft: () => void
}

const PROD_INSIDERS_CHANNEL_ID = 'potztg2sr8pv' // do not change
const DEV_INSIDERS_CHANNEL_ID = 'sben7j7yjhge' // replace as needed for testing
const INSIDERS_CHANNEL_ID = IS_PRODUCTION ? PROD_INSIDERS_CHANNEL_ID : DEV_INSIDERS_CHANNEL_ID

export function PostComposerForm({ onSubmit, onReportBug, onDeleteDraft }: ComposerFormProps) {
  const editorRef = useRef<MarkdownEditorRef>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLFormElement>(null)

  const [topRef, topInView] = useInView({ initialInView: true })
  const [bottomRef, bottomInView] = useInView({ initialInView: true })
  const [isEditorEmpty, setIsEditorEmpty] = useState(true)
  const { defaultProjectId } = useDefaultComposerValues()
  const { dropzone } = useUploadHelpers({ upload: editorRef.current?.uploadAndAppendAttachments })
  const postComposerState = useAtomValue(postComposerStateAtom)

  const createPost = usePostComposerCreatePost()
  const updatePost = usePostComposerUpdatePost()
  const { deleteLocalDraft } = usePostComposerLocalDraftActions()
  const createPostPublication = useCreatePostPublication()

  const methods = useFormContext<PostSchema>()
  const setValue = useFormSetValue<PostSchema>()

  const getProjectMembers = useGetProjectMembers({ projectId: methods.watch('project_id') })
  const projectMembers = flattenInfiniteData(getProjectMembers.data)
  const isCampsiteInsiders = methods.getValues('project_id') === INSIDERS_CHANNEL_ID

  const isSubmitting = methods.formState.isSubmitting

  const title = methods.watch('title')
  const poll = methods.watch('poll')
  const status = methods.watch('status')
  const noteId = methods.watch('note_id')
  // attachmentIds can be undefined when old clients upgrade
  const attachmentIds = methods.watch('attachment_ids') ?? []
  // this is for legacy post attachment support. it allows us to insert non-inline attachments on edit
  const attachments = methods.watch('attachments')

  const isPollEmpty = poll?.options.some((o) => !o.description.trim().length)
  const hasPostableContent = !!noteId || !isEditorEmpty || !!title?.trim().length || (attachmentIds.length ?? 0) > 0
  const isUploadingAttachments = hasOptimisticAttachments(attachmentIds)
  const hasPoll = !!poll
  const hasRequestFeedback = status === 'feedback_requested'

  const reset = useCallback(() => {
    setIsEditorEmpty(true)
    editorRef.current?.clearAndBlur()

    /**
     * Resetting to a stored draft would restore to non-empty values.
     * Reset to a blank default.
     */
    methods.reset(getPostSchemaDefaultValues(undefined, defaultProjectId))

    /**
     * Make sure to delete local draft only if it exists. For example,
     * we don't want to delete drafts when you are editing a post.
     */
    if (postComposerState?.type === PostComposerType.Draft) deleteLocalDraft()
  }, [defaultProjectId, deleteLocalDraft, methods, postComposerState?.type])

  const onBlurAtTop: BlurAtTopOptions['onBlur'] = useCallback((pos) => {
    titleRef.current?.focus()
    if (pos === 'end') {
      titleRef.current?.setSelectionRange(titleRef.current.value.length, titleRef.current.value.length)
    }
  }, [])

  const handleSubmit = methods.handleSubmit(async (data, event) => {
    if (isSubmitting || !hasPostableContent || isPollEmpty || isUploadingAttachments) return

    const submitter = (event?.nativeEvent as SubmitEvent & { submitter: HTMLButtonElement }).submitter
    const submitterId = submitter?.id
    const editorHTML = editorRef.current?.getHTML() ?? EMPTY_HTML

    const promise = (() => {
      switch (submitterId) {
        case PostComposerAction.SavePostDraft: {
          return createPost({ data, editorHTML, draft: true }).then((post) => {
            onSubmit?.({ type: 'draft-post', post })
            reset()
          })
        }

        case PostComposerAction.UpdatePost:
        case PostComposerAction.UpdatePostDraft: {
          return updatePost({ data, editorHTML }).then(() => {
            reset()
            onSubmit?.({ type: 'update-post' })
          })
        }

        case PostComposerAction.PublishPostDraft: {
          if (postComposerState?.type !== PostComposerType.EditDraftPost) return

          const initialPost = postComposerState.initialPost

          return updatePost({ data, editorHTML })
            .then(() => createPostPublication.mutate(initialPost.id))
            .then(() => {
              onSubmit?.({ type: 'new-post', post: initialPost })
              reset()
            })
        }

        case PostComposerAction.CreatePost:
        case PostComposerAction.CreateNewVersion: {
          return createPost({ data, editorHTML }).then((post) => {
            onSubmit?.({ type: 'new-post', post })
            reset()
          })
        }

        default:
          return undefined
      }
    })()

    return promise?.catch((e) => toast.error(e.message))
  })

  return (
    <form
      ref={containerRef}
      className='flex flex-1 flex-col overflow-hidden rounded-b-lg'
      onSubmit={handleSubmit}
      onKeyDownCapture={(evt) => {
        if (isMetaEnter(evt)) {
          evt.preventDefault()

          const id = getSubmitButtonId(postComposerState?.type)

          if (id) {
            document.getElementById(id)?.click()
          }
        }
      }}
    >
      <div className='flex items-center px-3 pb-2.5 pt-3'>
        <PostComposerProjectPicker />
        <PostComposerHeaderActions onDeleteDraft={onDeleteDraft} />
      </div>

      <input {...dropzone.getInputProps()} />

      <div className={cn('h-px w-full border-t', { 'border-primary': !topInView, 'border-transparent': topInView })} />

      <div className='relative flex flex-1 flex-col gap-1 overflow-y-auto pb-2 pt-0'>
        <div ref={topRef} />

        {isCampsiteInsiders && (
          <div className='bg-tertiary text-secondary mx-3 mb-2 flex items-center gap-2 rounded-md px-3 py-2'>
            <BugIcon />
            <UIText secondary>Found a bug? Use our feedback form instead!</UIText>
            <Button
              size='sm'
              className='ml-auto'
              variant='flat'
              onClick={() => onReportBug?.(methods.getValues('title'))}
            >
              Report a bug
            </Button>
          </div>
        )}

        <TitleTextField
          ref={titleRef}
          autoFocus
          onEnter={(e) => {
            if (!isMetaEnter(e)) {
              editorRef.current?.focus('start-newline')
            }
          }}
          onFocusNext={() => editorRef.current?.focus('restore')}
          placeholder='Subject (optional)'
          value={methods.getValues('title')}
          onChange={(val) => setValue('title', val)}
          className='px-3 pb-0 pt-1 text-[15px] font-semibold leading-snug'
        />

        <MarkdownEditor
          ref={editorRef}
          disabled={isSubmitting}
          initialAttachments={attachments}
          placeholder='What would you like to share?'
          content={methods.getValues('description_html')}
          enableInlineLinks
          enableInlineAttachments
          enableSyntaxHighlighting
          onEmptyDidChange={setIsEditorEmpty}
          onChangeDebounced={(html) => setValue('description_html', html)}
          onInlineAttachmentsChange={(attachments) => setValue('attachment_ids', Array.from(attachments))}
          containerClasses='px-3 py-1'
          minHeight='128px'
          maxHeight='none'
          appendBubbleMenuTo={() => containerRef.current ?? document.body}
          onBlurAtTop={onBlurAtTop}
          defaultMentions={projectMembers}
        />

        {hasPoll && (
          <div className='px-3'>
            <PostComposerPolls />
          </div>
        )}

        {hasRequestFeedback && (
          <div className='px-3'>
            <PostComposerFeedback />
          </div>
        )}

        {/* this exists for viewing & editing older posts */}
        <PostComposerUnfurledLink />

        <div ref={bottomRef} />
      </div>

      {noteId && <PostComposerNotePermissionDisclaimer noteId={noteId} />}

      <div
        className={cn('z-20 flex flex-row gap-2 border-t px-3 pt-2.5', {
          'border-primary': !bottomInView,
          'border-transparent': bottomInView,
          'pt-0': hasPoll && hasRequestFeedback
        })}
      >
        {!hasRequestFeedback && (
          <Button
            type='button'
            size='sm'
            disabled={isSubmitting}
            onClick={() => setValue('status', 'feedback_requested')}
            variant='flat'
          >
            Request feedback
          </Button>
        )}
      </div>

      <div className='bg-elevated sticky bottom-0 z-10 flex flex-row flex-nowrap justify-between gap-3 p-3 pr-2.5 pt-1.5 dark:bg-gray-900'>
        <PostComposerInteractiveAttachments dropzone={dropzone} editorRef={editorRef} />

        <PostComposerActions
          isUploadingAttachments={isUploadingAttachments}
          hasPostableContent={hasPostableContent}
          isPollEmpty={isPollEmpty}
        />
      </div>
    </form>
  )
}
