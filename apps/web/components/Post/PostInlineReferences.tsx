import { useMemo } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

import { TimelineEvent } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { NoteFilledIcon, PlayIcon, PostFilledIcon } from '@campsite/ui/Icons'

import { SidebarLink } from '@/components/Sidebar/SidebarLink'
import {
  isTimelineEventSubjectReferencedInComment,
  isTimelineEventSubjectReferencedInInternalRecord,
  isTimelineEventSubjectReferencedInNote,
  isTimelineEventSubjectReferencedInPost
} from '@/utils/timelineEvents/types'

interface PostInlineReferencesProps {
  timelineEvents: TimelineEvent[]
}

export function PostInlineReferences({ timelineEvents }: PostInlineReferencesProps) {
  const filteredTimelineEvents = useMemo(
    () => timelineEvents.filter((timelineEvent) => isTimelineEventSubjectReferencedInInternalRecord(timelineEvent)),
    [timelineEvents]
  )

  if (!filteredTimelineEvents.length) return null

  return (
    <AccordionPrimitive.Root type='single' collapsible className='group flex flex-col'>
      <AccordionPrimitive.Item value='references' className='flex flex-col'>
        <AccordionPrimitive.Header className='flex h-6 items-center'>
          <AccordionPrimitive.Trigger asChild>
            <span>
              <Button
                size='sm'
                leftSlot={
                  <PlayIcon
                    size={12}
                    className='text-quaternary rotate-0 transform transition-transform group-has-[[data-state="open"]]:rotate-90'
                  />
                }
                variant='plain'
              >
                References
              </Button>
            </span>
          </AccordionPrimitive.Trigger>
          {filteredTimelineEvents.length > 0 && (
            <span className='h-4.5 text-tertiary ml-2 mt-px flex items-center justify-center rounded bg-black/[0.04] px-1.5 font-mono text-[10px] font-semibold dark:bg-white/10'>
              {filteredTimelineEvents.length}
            </span>
          )}
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden'>
          <div className='mt-2 flex flex-col gap-px'>
            {filteredTimelineEvents.map((timelineEvent) => {
              if (isTimelineEventSubjectReferencedInPost(timelineEvent)) {
                return (
                  <SidebarLink
                    key={timelineEvent.id}
                    id={timelineEvent.id}
                    label={timelineEvent.post_reference.title}
                    leadingAccessory={<PostFilledIcon className='text-gray-800 dark:text-gray-500' />}
                    href={timelineEvent.post_reference.url}
                  />
                )
              }

              if (isTimelineEventSubjectReferencedInNote(timelineEvent)) {
                return (
                  <SidebarLink
                    key={timelineEvent.id}
                    id={timelineEvent.id}
                    label={timelineEvent.note_reference.title}
                    leadingAccessory={<NoteFilledIcon className='text-blue-500' />}
                    href={timelineEvent.note_reference.url}
                  />
                )
              }

              if (isTimelineEventSubjectReferencedInComment(timelineEvent)) {
                return (
                  <SidebarLink
                    key={timelineEvent.id}
                    id={timelineEvent.id}
                    label={`${timelineEvent.comment_reference_subject_title} (Comment)`}
                    leadingAccessory={
                      timelineEvent.comment_reference_subject_type === 'Post' ? (
                        <PostFilledIcon className='text-gray-800 dark:text-gray-500' />
                      ) : (
                        <NoteFilledIcon className='text-blue-500' />
                      )
                    }
                    href={timelineEvent.comment_reference.url}
                  />
                )
              }
            })}
          </div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  )
}
