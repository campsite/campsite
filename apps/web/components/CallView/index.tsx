/* eslint-disable max-lines */
import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Extension } from '@tiptap/core'
import deepEqual from 'fast-deep-equal'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'

import { BlurAtTopOptions, getMarkdownExtensions } from '@campsite/editor'
import { Call, CallRecording, CallRecordingTranscription } from '@campsite/types'
import {
  Avatar,
  Button,
  ChevronDownIcon,
  LayeredHotkeys,
  Link,
  LoadingSpinner,
  LockIcon,
  PaperAirplaneIcon,
  shortTimestamp,
  UIText
} from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

import { CallOverflowMenu } from '@/components/Calls/CallOverflowMenu'
import { useGetCallPeerMembers } from '@/components/Calls/useGetCallPeerUsers'
import { CallSharePopover } from '@/components/CallSharePopover'
import { CallFavoriteButton } from '@/components/CallView/CallFavoriteButton'
import { CallFollowUps } from '@/components/CallView/CallFollowUps'
import { CallSchema, callSchema, getDefaultValues } from '@/components/CallView/schema'
import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { EmptyState } from '@/components/EmptyState'
import { FullPageError } from '@/components/Error'
import { FacePile } from '@/components/FacePile'
import { FullPageLoading } from '@/components/FullPageLoading'
import { GeneratedContentFeedback } from '@/components/GeneratedContentFeedback'
import { InboxSplitViewTitleBar } from '@/components/InboxItems/InboxSplitView'
import { InboxTriageActions } from '@/components/InboxItems/InboxTriageActions'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import MarkdownEditor, { MarkdownEditorRef } from '@/components/MarkdownEditor'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { useTrackRecentlyViewedItem } from '@/components/Sidebar/RecentlyViewed/utils'
import { SplitViewBreadcrumbs } from '@/components/SplitView'
import { useIsSplitViewAvailable } from '@/components/SplitView/hooks'
import { SubjectEspcapeLayeredHotkeys } from '@/components/Subject'
import { ProjectAccessoryBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { BreadcrumbLabel } from '@/components/Titlebar/BreadcrumbTitlebar'
import { TitleTextField } from '@/components/TitleTextField'
import { useScope } from '@/contexts/scope'
import { useBeforeRouteChange } from '@/hooks/useBeforeRouteChange'
import { useCallSubscriptions } from '@/hooks/useCallSubscriptions'
import { useGetCall } from '@/hooks/useGetCall'
import { useGetCallRecordings } from '@/hooks/useGetCallRecordings'
import { useGetCallRecordingTranscription } from '@/hooks/useGetCallRecordingTranscription'
import { useUpdateCall } from '@/hooks/useUpdateCall'
import { convertNumberToTimestring } from '@/utils/convertNumberToTimestring'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { parseVtt } from '@/utils/vttParser'

import { ScrollableContainer } from '../ScrollableContainer'

const CallViewContext = createContext<string | null>(null)

export const useCallView = () => useContext(CallViewContext)

interface Props {
  callId: string
}

export function CallView({ callId }: Props) {
  const { data: call, isLoading: callIsLoading, error: callError } = useGetCall({ id: callId })
  const {
    data: recordingsData,
    isLoading: recordingsAreLoading,
    error: recordingsError
  } = useGetCallRecordings({ callId: callId })
  const recordings = flattenInfiniteData(recordingsData) || []
  const error = callError || recordingsError

  if (callIsLoading || recordingsAreLoading) {
    return <FullPageLoading />
  }

  if (error || !call) {
    return <FullPageError title='Unable to load call' message={error?.message ?? 'Something went wrong'} />
  }

  return (
    <CallViewContext.Provider value={call.id}>
      <SubjectEspcapeLayeredHotkeys />
      <CopyCurrentUrl override={call.url} />

      <InnerCallView call={call} recordings={recordings} />
    </CallViewContext.Provider>
  )
}

function InnerCallView({ call, recordings }: { call: Call; recordings: CallRecording[] }) {
  useCallSubscriptions({ call })

  const [activeRecordingIndex, setActiveRecordingIndex] = useState(0)

  const trackRef = useTrackRecentlyViewedItem({ id: call.id, call })

  if (!recordings.some((recording) => recording.url)) {
    return (
      <div className='flex h-full flex-1 flex-col'>
        <CallTitlebar call={call} />
        <EmptyState
          icon={<LoadingSpinner />}
          title='Processing call'
          message='We’re still processing this call — hang tight.'
        />
      </div>
    )
  }

  return (
    <div ref={trackRef} className='flex h-full flex-1 flex-col'>
      <CallTitlebar call={call} />

      <ScrollableContainer>
        <div className='mx-auto flex w-full max-w-4xl flex-none flex-col px-4 pt-4 md:pt-6 lg:pt-8 xl:pt-12 2xl:pt-14'>
          <RecordingVideos
            recordings={recordings}
            activeRecordingIndex={activeRecordingIndex}
            setActiveRecordingIndex={setActiveRecordingIndex}
          />
        </div>

        <div className='mx-auto mt-4 flex w-full max-w-3xl flex-none flex-col px-4 pb-4 md:pb-6 lg:pb-8'>
          <CallDetails call={call} />
        </div>

        <CallTranscripts
          recordings={recordings}
          activeRecordingIndex={activeRecordingIndex}
          setActiveRecordingIndex={setActiveRecordingIndex}
        />
      </ScrollableContainer>
    </div>
  )
}

function getVideoElementId(index: number) {
  return `recording-${index}`
}

function CallTranscripts({
  recordings,
  activeRecordingIndex,
  setActiveRecordingIndex
}: {
  recordings: CallRecording[]
  activeRecordingIndex: number
  setActiveRecordingIndex: (index: number) => void
}) {
  const recording = recordings.at(activeRecordingIndex)

  return (
    <div className='bg-secondary dark:bg-primary w-full flex-1 border-t'>
      <div className='mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-4 md:py-6 lg:gap-6 lg:py-8 xl:py-12 2xl:py-14'>
        <div className='flex flex-col gap-4'>
          <UIText size='text-lg' weight='font-bold'>
            Transcript
          </UIText>

          {recordings.length > 1 && (
            <div className='flex items-center gap-2'>
              {recordings.map((recording, index) => (
                <Button
                  round
                  key={recording.id}
                  variant={index === activeRecordingIndex ? 'flat' : 'plain'}
                  onClick={() => setActiveRecordingIndex(index)}
                  className={cn({
                    'text-tertiary hover:text-primary': index !== activeRecordingIndex
                  })}
                >
                  Recording {index + 1}
                </Button>
              ))}
            </div>
          )}
        </div>

        {recording ? (
          <CallRecordingTranscript callRecording={recording} activeRecordingIndex={activeRecordingIndex} />
        ) : (
          <MissingTranscript />
        )}
      </div>
    </div>
  )
}

function MissingTranscript() {
  return (
    <div className='flex flex-col gap-2'>
      <UIText tertiary>No transcription available for this recording.</UIText>
      <Link href='mailto:support@campsite.com' className='text-blue-500 hover:underline'>
        <UIText inherit>Get in touch</UIText>
      </Link>
    </div>
  )
}

function CallRecordingTranscript({
  callRecording,
  activeRecordingIndex
}: {
  callRecording: CallRecording
  activeRecordingIndex: number
}) {
  const { data: transcription } = useGetCallRecordingTranscription({
    callRecordingId: callRecording.id
  })

  if (callRecording.transcription_status === 'IN_PROGRESS')
    return (
      <EmptyState
        icon={<LoadingSpinner />}
        title='Processing transcript'
        message='We’re still processing this call’s transcript.'
      />
    )

  if (!transcription?.vtt) return <MissingTranscript />

  return <CallTranscript transcript={transcription} activeRecordingIndex={activeRecordingIndex} />
}

function CallTranscript({
  transcript,
  activeRecordingIndex
}: {
  transcript: CallRecordingTranscription
  activeRecordingIndex: number
}) {
  const { vtt } = transcript
  const parsedVtt = useMemo(() => parseVtt(vtt || ''), [vtt])

  if (!parsedVtt)
    return (
      <div className='flex flex-col gap-2'>
        <UIText tertiary>We had trouble parsing the recording for this transcription</UIText>
        <Link href='mailto:support@campsite.com' className='text-blue-500 hover:underline'>
          <UIText inherit>Get in touch</UIText>
        </Link>
      </div>
    )

  function navigateToTimestamp(timestamp: number) {
    const videoEl = document.getElementById(getVideoElementId(activeRecordingIndex)) as HTMLVideoElement

    if (!videoEl) return

    videoEl.currentTime = timestamp
  }

  const speakerNameToMember = new Map(transcript.speakers.map((speaker) => [speaker.name, speaker.call_peer.member]))

  return (
    <>
      <div className='flex flex-col'>
        {parsedVtt.map((group, index) => {
          const member = group[0].speaker && speakerNameToMember.get(group[0].speaker)
          const previousGroupHasSameUser = parsedVtt[index - 1]?.[0]?.speaker === group[0].speaker

          return (
            <div
              className={cn('grid grid-cols-[24px,1fr] gap-4 py-2 text-left')}
              // this is a static list, so we can be comfortable using the index as a key
              // eslint-disable-next-line react/no-array-index-key
              key={index}
            >
              <button
                onClick={() => navigateToTimestamp(Math.round(group[0].start))}
                className='text-tertiary hover:text-primary self-start'
              >
                {!member && group[0].speaker && (
                  <UIText className='truncate pt-px text-right' size='text-xs'>
                    {group[0].speaker}
                  </UIText>
                )}

                {member && (
                  <div className='flex justify-end'>
                    {!previousGroupHasSameUser && (
                      <ConditionalWrap
                        condition={!!member.id}
                        wrap={(children) => (
                          <MemberHovercard username={member.user.username}>{children}</MemberHovercard>
                        )}
                      >
                        <Avatar
                          urls={member.user.avatar_urls}
                          name={member.user.display_name}
                          tooltip={member.user.display_name}
                          size='sm'
                        />
                      </ConditionalWrap>
                    )}
                  </div>
                )}
              </button>
              <div>
                <button
                  onClick={() => navigateToTimestamp(Math.round(group[0].start))}
                  className='text-quaternary hover:text-primary block'
                >
                  <UIText className='font-mono text-[13px]' inherit>
                    {convertNumberToTimestring(group[0].start)}
                  </UIText>
                </button>

                {group.map((line) => {
                  return (
                    <Fragment key={`vtt-${line.index}`}>
                      <span
                        id={`vtt-${line.index.toString()}`}
                        className={cn('-mx-0.5 w-full select-text rounded px-0.5 py-0.5 text-[15px]')}
                        title={line.text}
                      >
                        {line.text}
                      </span>{' '}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function CallDetails({ call }: { call: Call }) {
  const callMembers = useGetCallPeerMembers({ peers: call.peers })
  const callUsers = callMembers.map((member) => member.user)

  return (
    <div className='flex flex-col gap-2 pt-8'>
      <div className='flex items-center justify-between'>
        <UIText quaternary>
          {shortTimestamp(call.created_at)} · {call.recordings_duration}
        </UIText>

        <CallFollowUps call={call} />
      </div>

      {call.processing_generated_summary ? (
        <EmptyState
          icon={<LoadingSpinner />}
          title='Processing summary'
          message='We’re still processing this call’s summary.'
        />
      ) : (
        <>
          {call.viewer_can_edit ? (
            <CallDetailsForm
              // key by call.id in order to reset tiptap editor state
              key={call.id}
              call={call}
            />
          ) : (
            <ReadOnlyCallSummary call={call} />
          )}
          {!call.is_edited && <GeneratedContentFeedback responseId={call.id} feature='call-summary' className='mt-4' />}
        </>
      )}

      <div className='mt-8 flex items-start gap-3'>
        <FacePile link users={callUsers} limit={5} size='sm' />
        <UIText className='pt-0.5' tertiary>
          {callMembers
            .map((member) =>
              member.role === 'guest' ? `${member.user.display_name} (Guest)` : member.user.display_name
            )
            .join(', ')}
        </UIText>
      </div>
    </div>
  )
}

function ReadOnlyCallSummary({ call }: { call: Call }) {
  const extensions = useMemo(() => getMarkdownExtensions({ linkUnfurl: {} }) as Extension[], [])
  const summary = call.summary_html

  return (
    <>
      <UIText selectable weight='font-bold' size='text-2xl' className='mt-1'>
        {call.title}
      </UIText>
      {summary && (
        <div className='prose mt-4 select-text whitespace-pre-wrap focus:outline-none lg:leading-normal'>
          <RichTextRenderer content={summary} extensions={extensions} />
        </div>
      )}
    </>
  )
}

function CallDetailsForm({ call }: { call: Call }) {
  const defaultValues = getDefaultValues(call)
  const methods = useForm<CallSchema>({ resolver: zodResolver(callSchema), defaultValues })

  return (
    <FormProvider {...methods}>
      <CallDetailsEditor call={call} defaultValues={defaultValues} />
    </FormProvider>
  )
}

function callFormHasChanges({
  isDirty,
  isValidating,
  isValid,
  watched,
  previous
}: {
  isDirty: boolean
  isValidating: boolean
  isValid: boolean
  watched: Partial<CallSchema>
  previous: Partial<CallSchema>
}) {
  return isDirty && !isValidating && isValid && !deepEqual(watched, previous)
}

function CallDetailsEditor({ call, defaultValues }: { call: Call; defaultValues: CallSchema }) {
  const methods = useFormContext<CallSchema>()
  const { mutate: updateCall } = useUpdateCall({ id: call.id })

  function save() {
    const values = methods.getValues()

    methods.reset(
      getDefaultValues({
        ...call,
        ...values,
        summary_html: values.summary
      })
    )

    updateCall(methods.getValues(), {
      onError: () => {
        toast.error('Failed to save call summary')
      }
    })
  }

  const debounceSave = useDebouncedCallback(save, 500)
  const watchedData = useWatch({ control: methods.control, defaultValue: defaultValues })
  const previousWatchedData = useRef(watchedData)

  const { isDirty, isValid, isValidating } = methods.formState

  useBeforeRouteChange(() => {
    if (
      callFormHasChanges({
        isDirty,
        isValid,
        isValidating,
        watched: watchedData,
        previous: previousWatchedData.current
      })
    ) {
      save()
    }
  })

  useEffect(() => {
    if (
      callFormHasChanges({
        isDirty,
        isValid,
        isValidating,
        watched: watchedData,
        previous: previousWatchedData.current
      })
    ) {
      debounceSave()
    } else {
      debounceSave.cancel()
    }
  }, [debounceSave, watchedData, isDirty, isValid, isValidating])

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<MarkdownEditorRef>(null)

  const focusTitle: BlurAtTopOptions['onBlur'] = useCallback((pos) => {
    titleRef.current?.focus()
    if (pos === 'end') {
      titleRef.current?.setSelectionRange(titleRef.current.value.length, titleRef.current.value.length)
    }
  }, [])

  return (
    <>
      <TitleTextField
        ref={titleRef}
        className='mx-auto w-full text-2xl font-bold leading-[1.2]'
        placeholder='Meeting title'
        value={methods.getValues('title')}
        onChange={(value) => methods.setValue('title', value, { shouldDirty: true, shouldValidate: true })}
        onEnter={() => editorRef.current?.focus('start-newline')}
        onFocusNext={() => editorRef.current?.focus('restore')}
      />
      <MarkdownEditor
        ref={editorRef}
        placeholder='Add meeting notes...'
        content={methods.getValues('summary')}
        onChangeDebounced={(html) => methods.setValue('summary', html, { shouldDirty: true })}
        onChangeDebounceMs={0}
        onBlurAtTop={focusTitle}
        containerClasses='px-0 pt-2'
        disableMentions
        disableSlashCommand
      />
    </>
  )
}

function RecordingVideos({
  recordings,
  activeRecordingIndex,
  setActiveRecordingIndex
}: {
  recordings: CallRecording[]
  activeRecordingIndex: number
  setActiveRecordingIndex: (index: number) => void
}) {
  const activeRecording = recordings.at(activeRecordingIndex)
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <>
      <LayeredHotkeys
        keys='space'
        callback={() => {
          if (!videoRef.current) return

          if (videoRef.current.paused) {
            videoRef.current.play()
          } else {
            videoRef.current.pause()
          }
        }}
        options={{ preventDefault: true }}
      />

      {activeRecording?.url && (
        <>
          <video
            key={activeRecording.id}
            controls
            preload='auto'
            className='dark:border-primary aspect-video overflow-hidden rounded-2xl border border-transparent'
            id={getVideoElementId(activeRecordingIndex)}
            ref={videoRef}
          >
            <source src={activeRecording.url} type={'video/mp4'} />
            <source src={activeRecording.url} />
          </video>
        </>
      )}
      {recordings.length > 1 && (
        <div className='mt-2 flex items-center justify-center gap-0.5'>
          {recordings.map((recording, index) => (
            <button
              key={recording.id}
              className='group/dot flex h-4 w-4 items-center justify-center'
              onClick={() => setActiveRecordingIndex(index)}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  index === activeRecordingIndex
                    ? 'bg-black dark:bg-white'
                    : 'bg-black/20 group-hover/dot:bg-black/30 dark:bg-white/20 dark:group-hover/dot:bg-white/30'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </>
  )
}

function CallTitlebar({ call }: { call: Call }) {
  const { isSplitViewAvailable } = useIsSplitViewAvailable()

  return (
    <InboxSplitViewTitleBar hideSidebarToggle={isSplitViewAvailable}>
      {isSplitViewAvailable ? (
        <SplitViewBreadcrumbs />
      ) : (
        <>
          <InboxTriageActions />
          <BreadcrumbProjectAndCallTitle call={call} />
        </>
      )}

      <div className='flex items-center justify-end gap-1.5'>
        <CallSharePopover call={call}>
          <Button leftSlot={<PaperAirplaneIcon />} variant='plain' tooltip='Share call'>
            Share
          </Button>
        </CallSharePopover>

        <CallOverflowMenu call={call} type='dropdown' />
      </div>
    </InboxSplitViewTitleBar>
  )
}

function BreadcrumbProjectAndCallTitle({ call }: { call: Call }) {
  const { scope } = useScope()
  const isProcessing = call.processing_generated_summary || call.processing_generated_title

  return (
    <div className='flex min-w-0 flex-1 items-center gap-1.5'>
      {call.project && call.project_permission !== 'none' ? (
        <>
          <Link
            href={`/${scope}/projects/${call.project.id}`}
            className='break-anywhere flex min-w-0 items-center gap-1 truncate'
          >
            <ProjectAccessoryBreadcrumbIcon project={call.project} />
            <BreadcrumbLabel>{call.project.name}</BreadcrumbLabel>
            {call.project.private && <LockIcon size={16} className='text-tertiary' />}
          </Link>

          <span className='-ml-1 -mr-0.5 inline-flex min-w-1 items-center'>
            {call.viewer_can_edit && (
              <CallSharePopover call={call} align='start'>
                <Button size='sm' variant='plain' iconOnly accessibilityLabel='Move to channel' className='w-5'>
                  <ChevronDownIcon strokeWidth='2' size={16} />
                </Button>
              </CallSharePopover>
            )}
          </span>
        </>
      ) : (
        <CallSharePopover call={call} align='start'>
          <Button size='sm' variant='plain' leftSlot={<LockIcon />} className='-mr-1'>
            <BreadcrumbLabel>Private</BreadcrumbLabel>
          </Button>
        </CallSharePopover>
      )}
      <UIText quaternary>/</UIText>
      {isProcessing && (
        <span className='opacity-50'>
          <LoadingSpinner />
        </span>
      )}
      <Link
        href={`/${scope}/calls/${call.id}`}
        title={call?.title || 'Untitled'}
        className='break-anywhere min-w-0 truncate'
      >
        <BreadcrumbLabel className='ml-1'>{call?.title || 'Untitled'}</BreadcrumbLabel>
      </Link>
      <CallFavoriteButton call={call} shortcutEnabled />
    </div>
  )
}
