/* eslint-disable max-lines */
import { Project, TimelineEvent } from '@campsite/types'
import {
  ArchiveIcon,
  ChatBubbleIcon,
  CheckCircleFilledFlushIcon,
  cn,
  LinearIcon,
  Link,
  PencilIcon,
  PinTackFilledIcon,
  PinTackIcon,
  ProjectIcon,
  RotateIcon,
  SignIcon,
  UIText
} from '@campsite/ui'

import { ProjectHovercard } from '@/components/InlinePost/ProjectHovercard'
import { ProjectAccessory } from '@/components/Projects/ProjectAccessory'
import { TimelineEventAccessory } from '@/components/TimelineEvent/TimelineEventAccessory'
import { TimelineEventCreatedAtText } from '@/components/TimelineEvent/TimelineEventCreatedAtText'
import { TimelineEventLinearIssueLink } from '@/components/TimelineEvent/TimelineEventLinearAccessories'
import { TimelineEventMemberActor } from '@/components/TimelineEvent/TimelineEventMemberActor'
import { TimelineEventParagraphContainer } from '@/components/TimelineEvent/TimelineEventParagraphContainer'
import { useScope } from '@/contexts/scope'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import {
  isTimelineEventCreatedLinearIssueFromPost,
  isTimelineEventPostReferencedInLinearExternalRecord,
  isTimelineEventPostResolved,
  isTimelineEventPostUnresolved,
  isTimelineEventSubjectPinned,
  isTimelineEventSubjectReferencedInComment,
  isTimelineEventSubjectReferencedInNote,
  isTimelineEventSubjectReferencedInPost,
  isTimelineEventSubjectTitleUpdated,
  isTimelineEventSubjectUnpinned,
  isTimelineEventSubjectUpdatedProject,
  TimelineEventCreatedLinearIssueFromPost,
  TimelineEventPostReferencedInLinearExternalRecord,
  TimelineEventPostResolved,
  TimelineEventPostUnresolved,
  TimelineEventSubjectPinned,
  TimelineEventSubjectReferencedInComment,
  TimelineEventSubjectReferencedInNote,
  TimelineEventSubjectReferencedInPost,
  TimelineEventSubjectTitleUpdated,
  TimelineEventSubjectType,
  TimelineEventSubjectUnpinned,
  TimelineEventSubjectUpdatedProject
} from '@/utils/timelineEvents/types'

// ----------------------------------------------------------------------------

interface TimelineEventContainerProps extends React.PropsWithChildren {
  className?: string
}

function TimelineEventContainer({ children, className }: TimelineEventContainerProps) {
  return <div className={cn('flex flex-row items-start gap-3 px-3 py-2.5 text-inherit', className)}>{children}</div>
}

// ----------------------------------------------------------------------------

function TimelineEventSubjectTitleUpdatedComponent({
  timelineEvent
}: {
  subjectType: TimelineEventSubjectType
  timelineEvent: TimelineEventSubjectTitleUpdated
}) {
  const { subject_updated_from_title, subject_updated_to_title } = timelineEvent

  return (
    <TimelineEventContainer>
      <TimelineEventAccessory>
        <PencilIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
        {!subject_updated_from_title ? (
          <>
            <UIText size='text-inherit' element='span' tertiary>
              added title
            </UIText>{' '}
            <UIText size='text-inherit' element='span' primary weight='font-medium'>
              &quot;{subject_updated_to_title}&quot;
            </UIText>
          </>
        ) : !subject_updated_to_title ? (
          <>
            <UIText size='text-inherit' element='span' tertiary>
              removed the title
            </UIText>
          </>
        ) : (
          <>
            <UIText size='text-inherit' element='span' tertiary>
              changed title to
            </UIText>{' '}
            <UIText size='text-inherit' element='span' primary weight='font-medium'>
              &quot;{subject_updated_to_title}&quot;
            </UIText>
          </>
        )}
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

function TimelineEventPostResolvedComponent({ timelineEvent }: { timelineEvent: TimelineEventPostResolved }) {
  return (
    <TimelineEventContainer>
      <TimelineEventAccessory className='size-5 text-green-500'>
        <CheckCircleFilledFlushIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
        <UIText size='text-inherit' element='span' tertiary>
          resolved the post
        </UIText>
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

function TimelineEventPostUnresolvedComponent({ timelineEvent }: { timelineEvent: TimelineEventPostUnresolved }) {
  return (
    <TimelineEventContainer>
      <TimelineEventAccessory>
        <RotateIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
        <UIText size='text-inherit' element='span' tertiary>
          reopened the post
        </UIText>
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

function TimelineEventPostReferencedInLinearExternalRecordComponent({
  timelineEvent
}: {
  timelineEvent: TimelineEventPostReferencedInLinearExternalRecord
}) {
  const { external_reference } = timelineEvent

  return (
    <TimelineEventContainer>
      <TimelineEventAccessory className='size-6'>
        <LinearIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <UIText size='text-inherit' element='span' tertiary>
          Mentioned in{` `}
        </UIText>
        <TimelineEventLinearIssueLink externalRecord={external_reference} />
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

function TimelineEventCreatedLinearIssueFromPostComponent({
  timelineEvent
}: {
  timelineEvent: TimelineEventCreatedLinearIssueFromPost
}) {
  const { external_reference, member_actor } = timelineEvent

  return (
    <TimelineEventContainer>
      <TimelineEventAccessory className='size-6'>
        <LinearIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        {member_actor ? (
          <>
            <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
            <UIText size='text-inherit' element='span' tertiary>
              created
            </UIText>
          </>
        ) : (
          <UIText size='text-inherit' element='span' tertiary>
            A Linear issue was created from this post:
          </UIText>
        )}

        <TimelineEventLinearIssueLink externalRecord={external_reference} />
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

function TimelineEventSubjectPinnedComponent({
  subjectType,
  timelineEvent
}: {
  subjectType: TimelineEventSubjectType
  timelineEvent: TimelineEventSubjectPinned
}) {
  return (
    <TimelineEventContainer>
      <TimelineEventAccessory className='text-brand-primary'>
        <PinTackFilledIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
        <UIText size='text-inherit' element='span' tertiary>
          pinned the {subjectType}
        </UIText>
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

function TimelineEventSubjectUnpinnedComponent({
  subjectType,
  timelineEvent
}: {
  subjectType: TimelineEventSubjectType
  timelineEvent: TimelineEventSubjectUnpinned
}) {
  return (
    <TimelineEventContainer>
      <TimelineEventAccessory>
        <PinTackIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
        <UIText size='text-inherit' element='span' tertiary>
          unpinned the {subjectType}
        </UIText>
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

function TimelineEventSubjectReferencedInPostComponent({
  subjectType,
  timelineEvent
}: {
  subjectType: TimelineEventSubjectType
  timelineEvent: TimelineEventSubjectReferencedInPost
}) {
  const { post_reference } = timelineEvent

  return (
    <TimelineEventContainer>
      <TimelineEventAccessory>
        <SignIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
        <UIText size='text-inherit' element='span' tertiary>
          referenced this {subjectType} in
        </UIText>{' '}
        <Link href={post_reference.url} className='hover:underline'>
          <UIText size='text-inherit' element='span' primary weight='font-medium'>
            {post_reference.title}
          </UIText>
        </Link>
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

function TimelineEventSubjectReferencedInCommentComponent({
  subjectType,
  timelineEvent
}: {
  subjectType: TimelineEventSubjectType
  timelineEvent: TimelineEventSubjectReferencedInComment
}) {
  const { comment_reference, comment_reference_subject_title } = timelineEvent

  return (
    <TimelineEventContainer>
      <TimelineEventAccessory>
        <SignIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
        <UIText size='text-inherit' element='span' tertiary>
          referenced this {subjectType} in a
        </UIText>{' '}
        <Link href={comment_reference.url} className='group/link'>
          <UIText
            size='text-inherit'
            element='span'
            primary
            weight='font-medium'
            className='group-hover/link:underline'
          >
            comment
          </UIText>
          {comment_reference_subject_title && (
            <>
              {' '}
              <UIText size='text-inherit' element='span' tertiary>
                on
              </UIText>{' '}
              <UIText
                size='text-inherit'
                element='span'
                primary
                weight='font-medium'
                className='group-hover/link:underline'
              >
                {comment_reference_subject_title}
              </UIText>
            </>
          )}
        </Link>
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

function TimelineEventSubjectReferencedInNoteComponent({
  subjectType,
  timelineEvent
}: {
  subjectType: TimelineEventSubjectType
  timelineEvent: TimelineEventSubjectReferencedInNote
}) {
  const { note_reference } = timelineEvent

  return (
    <TimelineEventContainer>
      <TimelineEventAccessory>
        <SignIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
        <UIText size='text-inherit' element='span' tertiary>
          referenced this {subjectType} in
        </UIText>{' '}
        <Link href={note_reference.url} className='hover:underline'>
          <UIText size='text-inherit' element='span' primary weight='font-medium'>
            {note_reference.title}
          </UIText>
        </Link>
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

/**
 * A wrapper around ProjectAccessory that adds an `inline` class to the SVG icons, but not for the accessory emoji.
 */
function InlineProjectAccessory({
  project
}: {
  project: Pick<Project, 'accessory' | 'archived' | 'private' | 'message_thread_id'>
}) {
  const hasNoEmojiAccessories = useCurrentUserOrOrganizationHasFeature('no_emoji_accessories')
  const isChatProject = !!project.message_thread_id

  if (project.accessory && !hasNoEmojiAccessories) {
    return <ProjectAccessory project={project} />
  }

  const Icon = project.archived ? ArchiveIcon : isChatProject ? ChatBubbleIcon : ProjectIcon

  return <Icon className='inline h-5 w-5 shrink-0' />
}

function TimelineEventSubjectUpdatedProjectComponent({
  subjectType,
  timelineEvent
}: {
  subjectType: TimelineEventSubjectType
  timelineEvent: TimelineEventSubjectUpdatedProject
}) {
  const { scope } = useScope()
  const { subject_updated_from_project, subject_updated_to_project } = timelineEvent

  return (
    <TimelineEventContainer>
      <TimelineEventAccessory>
        <ProjectIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
        {!!subject_updated_from_project && !!subject_updated_to_project ? (
          <>
            <UIText size='text-inherit' element='span' tertiary>
              moved this {subjectType} from
            </UIText>{' '}
            <ProjectHovercard projectId={subject_updated_from_project.id}>
              <Link href={`/${scope}/projects/${subject_updated_from_project.id}`} className='group/link inline'>
                <InlineProjectAccessory project={subject_updated_from_project} />{' '}
                <UIText
                  primary
                  element='span'
                  size='text-inherit'
                  weight='font-medium'
                  className='group-hover/link:underline'
                >
                  {subject_updated_from_project.name}
                </UIText>
              </Link>
            </ProjectHovercard>{' '}
            <UIText size='text-inherit' element='span' tertiary>
              to
            </UIText>{' '}
            <ProjectHovercard projectId={subject_updated_to_project.id}>
              <Link href={`/${scope}/projects/${subject_updated_to_project.id}`} className='group/link inline'>
                <InlineProjectAccessory project={subject_updated_to_project} />{' '}
                <UIText
                  primary
                  element='span'
                  size='text-inherit'
                  weight='font-medium'
                  className='group-hover/link:underline'
                >
                  {subject_updated_to_project.name}
                </UIText>
              </Link>
            </ProjectHovercard>
          </>
        ) : !!subject_updated_from_project && !subject_updated_to_project ? (
          <>
            <UIText size='text-inherit' element='span' tertiary>
              removed this {subjectType} from
            </UIText>{' '}
            <ProjectHovercard projectId={subject_updated_from_project.id}>
              <Link href={`/${scope}/projects/${subject_updated_from_project.id}`} className='group/link inline'>
                <InlineProjectAccessory project={subject_updated_from_project} />{' '}
                <UIText
                  primary
                  element='span'
                  size='text-inherit'
                  weight='font-medium'
                  className='group-hover/link:underline'
                >
                  {subject_updated_from_project.name}
                </UIText>
              </Link>
            </ProjectHovercard>
          </>
        ) : !subject_updated_from_project && !!subject_updated_to_project ? (
          <>
            <UIText size='text-inherit' element='span' tertiary>
              added this {subjectType} to
            </UIText>{' '}
            <ProjectHovercard projectId={subject_updated_to_project.id}>
              <Link href={`/${scope}/projects/${subject_updated_to_project.id}`} className='group/link inline'>
                <InlineProjectAccessory project={subject_updated_to_project} />{' '}
                <UIText
                  primary
                  element='span'
                  size='text-inherit'
                  weight='font-medium'
                  className='group-hover/link:underline'
                >
                  {subject_updated_to_project.name}
                </UIText>
              </Link>
            </ProjectHovercard>
          </>
        ) : null}
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

export function TimelineEventSubject({
  timelineEvent,
  subjectType
}: {
  timelineEvent: TimelineEvent
  subjectType: TimelineEventSubjectType
}) {
  if (isTimelineEventSubjectTitleUpdated(timelineEvent)) {
    return <TimelineEventSubjectTitleUpdatedComponent subjectType={subjectType} timelineEvent={timelineEvent} />
  } else if (isTimelineEventPostResolved(timelineEvent)) {
    return <TimelineEventPostResolvedComponent timelineEvent={timelineEvent} />
  } else if (isTimelineEventPostUnresolved(timelineEvent)) {
    return <TimelineEventPostUnresolvedComponent timelineEvent={timelineEvent} />
  } else if (isTimelineEventPostReferencedInLinearExternalRecord(timelineEvent)) {
    return <TimelineEventPostReferencedInLinearExternalRecordComponent timelineEvent={timelineEvent} />
  } else if (isTimelineEventCreatedLinearIssueFromPost(timelineEvent)) {
    return <TimelineEventCreatedLinearIssueFromPostComponent timelineEvent={timelineEvent} />
  } else if (isTimelineEventSubjectPinned(timelineEvent)) {
    return <TimelineEventSubjectPinnedComponent subjectType={subjectType} timelineEvent={timelineEvent} />
  } else if (isTimelineEventSubjectUnpinned(timelineEvent)) {
    return <TimelineEventSubjectUnpinnedComponent subjectType={subjectType} timelineEvent={timelineEvent} />
  } else if (isTimelineEventSubjectReferencedInPost(timelineEvent)) {
    return <TimelineEventSubjectReferencedInPostComponent subjectType={subjectType} timelineEvent={timelineEvent} />
  } else if (isTimelineEventSubjectReferencedInComment(timelineEvent)) {
    return <TimelineEventSubjectReferencedInCommentComponent subjectType={subjectType} timelineEvent={timelineEvent} />
  } else if (isTimelineEventSubjectReferencedInNote(timelineEvent)) {
    return <TimelineEventSubjectReferencedInNoteComponent subjectType={subjectType} timelineEvent={timelineEvent} />
  } else if (isTimelineEventSubjectUpdatedProject(timelineEvent)) {
    return <TimelineEventSubjectUpdatedProjectComponent subjectType={subjectType} timelineEvent={timelineEvent} />
  }
}
