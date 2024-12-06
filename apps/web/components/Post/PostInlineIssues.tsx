import { useEffect, useMemo, useState } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

import { Post, TimelineEvent } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { InformationIcon, PlayIcon, PlusIcon } from '@campsite/ui/Icons'
import { Tooltip } from '@campsite/ui/Tooltip'

import { LinearPostIssueComposerDialog } from '@/components/LinearIssueComposerDialog'
import { ConnectOrRequestIssueIntegrationDialog } from '@/components/Post/ConnectOrRequestIssueIntegrationDialog'
import { SidebarLink } from '@/components/Sidebar/SidebarLink'
import { TimelineEventLinearIssueIcon } from '@/components/TimelineEvent'
import { useGetLinearIntegration } from '@/hooks/useGetLinearIntegration'
import { useGetPostLinearTimelineEvents } from '@/hooks/useGetPostLinearTimelineEvents'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import {
  isTimelineEventCommentReferencedInLinearExternalRecord,
  isTimelineEventCreatedLinearIssueFromComment,
  isTimelineEventCreatedLinearIssueFromPost,
  isTimelineEventPostReferencedInLinearExternalRecord
} from '@/utils/timelineEvents/types'

// ----------------------------------------------------------------------------

interface PostInlineIssuesInnerProps {
  issues: TimelineEvent[]
  post: Post
}

function PostInlineIssuesInner({ issues, post }: PostInlineIssuesInnerProps) {
  const [linearIssueDialogIsOpen, setLinearIssueDialogIsOpen] = useState(false)
  // default to expanded if there are issues
  const [value, setValue] = useState<string>(issues.length ? 'issues' : '')

  // auto expand if the user adds an issue
  useEffect(() => {
    if (issues.length) setValue('issues')
    if (!issues.length) setValue('')
  }, [issues.length])

  return (
    <>
      <LinearPostIssueComposerDialog
        key={linearIssueDialogIsOpen ? 'open' : 'closed'}
        open={linearIssueDialogIsOpen}
        onOpenChange={setLinearIssueDialogIsOpen}
        postId={post.id}
        defaultValues={{ title: post.title }}
      />

      <AccordionPrimitive.Root
        value={value}
        onValueChange={setValue}
        type='single'
        collapsible
        className='group flex flex-col'
      >
        <AccordionPrimitive.Item disabled={issues.length === 0} value='issues' className='flex flex-col'>
          <AccordionPrimitive.Header className='flex h-6 items-center'>
            <AccordionPrimitive.Trigger asChild>
              <span>
                <Button
                  disabled={issues.length === 0}
                  size='sm'
                  leftSlot={
                    <PlayIcon
                      size={12}
                      className='text-quaternary rotate-0 transform transition-transform group-has-[[data-state="open"]]:rotate-90'
                    />
                  }
                  variant='plain'
                >
                  Issues
                </Button>
              </span>
            </AccordionPrimitive.Trigger>
            {issues.length > 0 && (
              <span className='h-4.5 text-tertiary ml-2 mt-px flex items-center justify-center rounded bg-black/[0.04] px-1.5 font-mono text-[10px] font-semibold dark:bg-white/10'>
                {issues.length}
              </span>
            )}
            {post.viewer_can_create_issue && (
              <Button
                onClick={() => {
                  setLinearIssueDialogIsOpen(true)
                }}
                size='sm'
                iconOnly={<PlusIcon size={16} />}
                variant='plain'
                className='ml-auto'
                accessibilityLabel='Add issue'
              />
            )}
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden'>
            <div className='mt-2 flex flex-col gap-px'>
              {issues.map((timelineEvent) => {
                if (isTimelineEventCreatedLinearIssueFromPost(timelineEvent)) {
                  return (
                    <SidebarLink
                      key={timelineEvent.id}
                      id={timelineEvent.id}
                      label={timelineEvent.external_reference.remote_record_title}
                      leadingAccessory={
                        <span style={{ color: timelineEvent.external_reference.linear_issue_state.color }}>
                          <TimelineEventLinearIssueIcon externalRecord={timelineEvent.external_reference} />
                        </span>
                      }
                      href={timelineEvent.external_reference.remote_record_url}
                      external
                    />
                  )
                }

                if (isTimelineEventCreatedLinearIssueFromComment(timelineEvent)) {
                  return (
                    <SidebarLink
                      key={timelineEvent.id}
                      id={timelineEvent.id}
                      label={timelineEvent.external_reference.remote_record_title}
                      leadingAccessory={
                        <span style={{ color: timelineEvent.external_reference.linear_issue_state.color }}>
                          <TimelineEventLinearIssueIcon externalRecord={timelineEvent.external_reference} />
                        </span>
                      }
                      href={timelineEvent.external_reference.remote_record_url}
                      external
                    />
                  )
                }

                if (isTimelineEventPostReferencedInLinearExternalRecord(timelineEvent)) {
                  return (
                    <SidebarLink
                      key={timelineEvent.id}
                      id={timelineEvent.id}
                      label={timelineEvent.external_reference.remote_record_title}
                      leadingAccessory={
                        <span style={{ color: timelineEvent.external_reference.linear_issue_state.color }}>
                          <TimelineEventLinearIssueIcon externalRecord={timelineEvent.external_reference} />
                        </span>
                      }
                      href={timelineEvent.external_reference.remote_record_url}
                    />
                  )
                }

                if (isTimelineEventCommentReferencedInLinearExternalRecord(timelineEvent)) {
                  return (
                    <SidebarLink
                      key={timelineEvent.id}
                      id={timelineEvent.id}
                      label={timelineEvent.external_reference.remote_record_title}
                      leadingAccessory={
                        <span style={{ color: timelineEvent.external_reference.linear_issue_state.color }}>
                          <TimelineEventLinearIssueIcon externalRecord={timelineEvent.external_reference} />
                        </span>
                      }
                      href={timelineEvent.external_reference.remote_record_url}
                    />
                  )
                }
              })}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      </AccordionPrimitive.Root>
    </>
  )
}

// ----------------------------------------------------------------------------

interface PostInlineIssuesProps {
  post: Post
}

function PostInlineIssues({ post }: PostInlineIssuesProps) {
  const { data: hasLinearIntegration } = useGetLinearIntegration()
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const viewerIsAdmin = useViewerIsAdmin()

  const getLinearTimelineEvents = useGetPostLinearTimelineEvents({ postId: post.id })
  const linearTimelineEvents = useMemo(
    () => flattenInfiniteData(getLinearTimelineEvents.data) ?? [],
    [getLinearTimelineEvents.data]
  )

  if (!hasLinearIntegration) {
    return (
      <>
        <ConnectOrRequestIssueIntegrationDialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen} />

        <div className='flex h-6 items-center'>
          <Button disabled size='sm' variant='plain'>
            Issues
          </Button>
          <Tooltip
            label={
              viewerIsAdmin ? 'Create and connect issues to this post' : 'Ask an admin to connect your issue tracker'
            }
            asChild
          >
            <span className='text-quaternary'>
              <InformationIcon size={18} />
            </span>
          </Tooltip>

          {viewerIsAdmin && (
            <Button
              onClick={() => {
                setRequestDialogOpen(true)
              }}
              size='sm'
              iconOnly={<PlusIcon size={16} />}
              variant='plain'
              className='ml-auto'
              accessibilityLabel='Add issue'
            />
          )}
        </div>
      </>
    )
  }

  return <PostInlineIssuesInner post={post} issues={linearTimelineEvents} />
}

// ----------------------------------------------------------------------------

export { PostInlineIssues }
