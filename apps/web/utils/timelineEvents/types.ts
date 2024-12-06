import {
  Comment,
  ExternalRecord,
  MiniProject,
  Note,
  OrganizationMember,
  Post,
  TimelineEvent
} from '@campsite/types/generated'

// ----------------------------------------------------------------------------

export type TimelineEventSubjectType = 'post' | 'note'

// ----------------------------------------------------------------------------

export interface TimelineEventSubjectTitleUpdated extends TimelineEvent {
  action: 'subject_title_updated'
  subject_updated_from_title: string | null
  subject_updated_to_title: string | null
  member_actor: OrganizationMember
}

export function isTimelineEventSubjectTitleUpdated(event: TimelineEvent): event is TimelineEventSubjectTitleUpdated {
  return (
    event.action === 'subject_title_updated' &&
    !!event.member_actor &&
    (!!event.subject_updated_from_title || !!event.subject_updated_to_title)
  )
}

// ----------------------------------------------------------------------------

export interface TimelineEventPostResolved extends TimelineEvent {
  action: 'post_resolved'
  member_actor: OrganizationMember
}

export function isTimelineEventPostResolved(event: TimelineEvent): event is TimelineEventPostResolved {
  return event.action === 'post_resolved' && !!event.member_actor
}

// ----------------------------------------------------------------------------

export interface TimelineEventPostUnresolved extends TimelineEvent {
  action: 'post_unresolved'
  member_actor: OrganizationMember
}

export function isTimelineEventPostUnresolved(event: TimelineEvent): event is TimelineEventPostUnresolved {
  return event.action === 'post_unresolved' && !!event.member_actor
}

// ----------------------------------------------------------------------------

export interface LinearIssueExternalRecord extends ExternalRecord {
  service: 'linear'
  type: 'Issue'
}

function isLinearIssueExternalRecord(externalRecord: ExternalRecord): externalRecord is LinearIssueExternalRecord {
  return externalRecord.service === 'linear' && externalRecord.type === 'Issue'
}

// ----------------------------------------------------------------------------

export interface LinearCommentExternalRecord extends ExternalRecord {
  service: 'linear'
  type: 'Comment'
}

function isLinearCommentExternalRecord(externalRecord: ExternalRecord): externalRecord is LinearCommentExternalRecord {
  return externalRecord.service === 'linear' && externalRecord.type === 'Comment'
}

// ----------------------------------------------------------------------------

export interface TimelineEventPostReferencedInLinearExternalRecord extends TimelineEvent {
  action: 'post_referenced_in_external_record'
  external_reference: LinearIssueExternalRecord | LinearCommentExternalRecord
}

export function isTimelineEventPostReferencedInLinearExternalRecord(
  event: TimelineEvent
): event is TimelineEventPostReferencedInLinearExternalRecord {
  return (
    event.action === 'post_referenced_in_external_record' &&
    !!event.external_reference &&
    (isLinearIssueExternalRecord(event.external_reference) || isLinearCommentExternalRecord(event.external_reference))
  )
}

// ----------------------------------------------------------------------------

export interface TimelineEventCreatedLinearIssueFromPost extends TimelineEvent {
  action: 'created_linear_issue_from_post'
  member_actor: OrganizationMember | null
  external_reference: LinearIssueExternalRecord
}

export function isTimelineEventCreatedLinearIssueFromPost(
  event: TimelineEvent
): event is TimelineEventCreatedLinearIssueFromPost {
  return (
    event.action === 'created_linear_issue_from_post' &&
    !!event.external_reference &&
    isLinearIssueExternalRecord(event.external_reference)
  )
}

// ----------------------------------------------------------------------------

export interface TimelineEventSubjectPinned extends TimelineEvent {
  action: 'subject_pinned'
  member_actor: OrganizationMember
}

export function isTimelineEventSubjectPinned(event: TimelineEvent): event is TimelineEventSubjectPinned {
  return event.action === 'subject_pinned' && !!event.member_actor
}

// ----------------------------------------------------------------------------

export interface TimelineEventSubjectUnpinned extends TimelineEvent {
  action: 'subject_unpinned'
  member_actor: OrganizationMember
}

export function isTimelineEventSubjectUnpinned(event: TimelineEvent): event is TimelineEventSubjectUnpinned {
  return event.action === 'subject_unpinned' && !!event.member_actor
}

// ----------------------------------------------------------------------------

export interface TimelineEventCommentReferencedInLinearExternalRecord extends TimelineEvent {
  action: 'comment_referenced_in_external_record'
  external_reference: LinearIssueExternalRecord | LinearCommentExternalRecord
}

export function isTimelineEventCommentReferencedInLinearExternalRecord(
  event: TimelineEvent
): event is TimelineEventCommentReferencedInLinearExternalRecord {
  return (
    event.action === 'comment_referenced_in_external_record' &&
    !!event.external_reference &&
    (isLinearIssueExternalRecord(event.external_reference) || isLinearCommentExternalRecord(event.external_reference))
  )
}

// ----------------------------------------------------------------------------

export interface TimelineEventCreatedLinearIssueFromComment extends TimelineEvent {
  action: 'created_linear_issue_from_comment'
  member_actor: OrganizationMember | null
  external_reference: LinearIssueExternalRecord
}

export function isTimelineEventCreatedLinearIssueFromComment(
  event: TimelineEvent
): event is TimelineEventCreatedLinearIssueFromComment {
  return (
    event.action === 'created_linear_issue_from_comment' &&
    !!event.external_reference &&
    isLinearIssueExternalRecord(event.external_reference)
  )
}

// ----------------------------------------------------------------------------

interface TimelineEventSubjectReferencedInInternalRecord extends TimelineEvent {
  action: 'subject_referenced_in_internal_record'
  member_actor: OrganizationMember
}

export function isTimelineEventSubjectReferencedInInternalRecord(
  event: TimelineEvent
): event is TimelineEventSubjectReferencedInInternalRecord {
  return event.action === 'subject_referenced_in_internal_record' && !!event.member_actor
}

// ----------------------------------------------------------------------------

export interface TimelineEventSubjectReferencedInPost extends TimelineEvent {
  action: 'subject_referenced_in_internal_record'
  member_actor: OrganizationMember
  post_reference: Post
}

export function isTimelineEventSubjectReferencedInPost(
  event: TimelineEvent
): event is TimelineEventSubjectReferencedInPost {
  return event.action === 'subject_referenced_in_internal_record' && !!event.member_actor && !!event.post_reference
}

// ----------------------------------------------------------------------------

export interface TimelineEventSubjectReferencedInComment extends TimelineEvent {
  action: 'subject_referenced_in_internal_record'
  member_actor: OrganizationMember
  comment_reference: Comment
  comment_reference_subject_type: 'Post' | 'Note'
  comment_reference_subject_title: string | null
}

export function isTimelineEventSubjectReferencedInComment(
  event: TimelineEvent
): event is TimelineEventSubjectReferencedInComment {
  return (
    event.action === 'subject_referenced_in_internal_record' &&
    !!event.member_actor &&
    !!event.comment_reference &&
    (event.comment_reference_subject_type === 'Post' || event.comment_reference_subject_type === 'Note')
  )
}

// ----------------------------------------------------------------------------

export interface TimelineEventSubjectReferencedInNote extends TimelineEvent {
  action: 'subject_referenced_in_internal_record'
  member_actor: OrganizationMember
  note_reference: Note
}

export function isTimelineEventSubjectReferencedInNote(
  event: TimelineEvent
): event is TimelineEventSubjectReferencedInNote {
  return event.action === 'subject_referenced_in_internal_record' && !!event.member_actor && !!event.note_reference
}

// ----------------------------------------------------------------------------

export interface TimelineEventSubjectUpdatedProject extends TimelineEvent {
  action: 'subject_project_updated'
  member_actor: OrganizationMember
  subject_updated_from_project: MiniProject | null
  subject_updated_to_project: MiniProject | null
}

export function isTimelineEventSubjectUpdatedProject(
  event: TimelineEvent
): event is TimelineEventSubjectUpdatedProject {
  return (
    event.action === 'subject_project_updated' &&
    !!event.member_actor &&
    (!!event.subject_updated_from_project || !!event.subject_updated_to_project)
  )
}

// ----------------------------------------------------------------------------
