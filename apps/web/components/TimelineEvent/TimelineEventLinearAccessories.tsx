import { Link, Tooltip, UIText } from '@campsite/ui'
import {
  LinearBacklogIcon,
  LinearCanceledIcon,
  LinearDoneIcon,
  LinearInProgressIcon,
  LinearTodoIcon,
  LinearTriageIcon
} from '@campsite/ui/Icons'

import { LinearCommentExternalRecord, LinearIssueExternalRecord } from '@/utils/timelineEvents/types'

// ----------------------------------------------------------------------------

function TimelineEventLinearIssueIcon({
  externalRecord,
  ...props
}: {
  externalRecord: LinearIssueExternalRecord | LinearCommentExternalRecord
  size?: number
  className?: string
}) {
  switch (externalRecord.linear_issue_state?.type) {
    case 'triage': {
      return <LinearTriageIcon {...props} />
    }
    case 'backlog': {
      return <LinearBacklogIcon {...props} />
    }
    case 'unstarted': {
      return <LinearTodoIcon {...props} />
    }
    case 'started': {
      return <LinearInProgressIcon {...props} />
    }
    case 'completed': {
      return <LinearDoneIcon {...props} />
    }
    case 'canceled': {
      return <LinearCanceledIcon {...props} />
    }
    default: {
      return null
    }
  }
}

// ----------------------------------------------------------------------------

function TimelineEventLinearIssueLink({
  externalRecord
}: {
  externalRecord: LinearIssueExternalRecord | LinearCommentExternalRecord
}) {
  return (
    <Link href={externalRecord.remote_record_url} target='_blank' rel='noreferrer' className='inline hover:underline'>
      {externalRecord.linear_issue_state && (
        <Tooltip label={externalRecord.linear_issue_state.name}>
          <span style={{ color: externalRecord.linear_issue_state.color }} className='mx-0.5'>
            <TimelineEventLinearIssueIcon
              externalRecord={externalRecord}
              className='size-4.5 -mt-px mr-px inline shrink-0'
            />
          </span>
        </Tooltip>
      )}
      <UIText element='span' primary weight='font-medium' size='text-inherit'>
        {externalRecord.remote_record_title}
      </UIText>
    </Link>
  )
}

// ----------------------------------------------------------------------------

export { TimelineEventLinearIssueIcon, TimelineEventLinearIssueLink }
