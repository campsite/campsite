# frozen_string_literal: true

class TimelineEvent
  class SubjectReferencedInInternalRecord
    def initialize(actor:, subject:, changes:)
      @actor = actor
      @subject = subject
      @changes = changes
    end

    def sync
      sync_posts
      sync_comments
      sync_notes
    end

    private

    def sync_posts
      id_to_reject = if @subject.is_a?(Comment)
        @subject.subject.public_id
      else
        @subject.public_id
      end

      previous_linked_post_ids = @subject.extract_post_ids(@changes.first).reject { |id| id == id_to_reject }
      current_linked_post_ids = @subject.extract_post_ids(@changes.last).reject { |id| id == id_to_reject }

      removed_linked_post_ids = previous_linked_post_ids - current_linked_post_ids
      added_linked_post_ids = current_linked_post_ids - previous_linked_post_ids

      removed_referenced_posts = @subject.organization.kept_published_posts.where(public_id: removed_linked_post_ids)
      added_referenced_posts = @subject.organization.kept_published_posts.where(public_id: added_linked_post_ids)

      removed_referenced_posts.each do |referenced_post|
        referenced_post.timeline_events.where(action: :subject_referenced_in_internal_record, reference: @subject).destroy_all
      end

      added_referenced_posts.each do |referenced_post|
        referenced_post.timeline_events.find_or_create_by!(
          actor: @actor,
          action: :subject_referenced_in_internal_record,
          reference: @subject,
        )
      end
    end

    def sync_comments
      subject_to_reject = if @subject.is_a?(Comment)
        @subject.subject
      else
        @subject
      end

      previous_linked_comment_ids = @subject.extract_comment_ids(@changes.first)
      current_linked_comment_ids = @subject.extract_comment_ids(@changes.last)

      removed_linked_comment_ids = previous_linked_comment_ids - current_linked_comment_ids
      added_linked_comment_ids = current_linked_comment_ids - previous_linked_comment_ids

      removed_referenced_comments = Comment.joins(:member)
        .where(public_id: removed_linked_comment_ids)
        .where.not(subject: subject_to_reject)
        .where(organization_memberships: { organization: @subject.organization })
        .kept
      added_referenced_comments = Comment.joins(:member)
        .where(public_id: added_linked_comment_ids).where.not(subject: subject_to_reject)
        .where.not(subject: subject_to_reject)
        .where(organization_memberships: { organization: @subject.organization })
        .kept

      removed_referenced_comments.each do |referenced_comment|
        referenced_comment.subject.timeline_events.where(action: :subject_referenced_in_internal_record, reference: @subject).destroy_all
      end

      added_referenced_comments.each do |referenced_comment|
        referenced_comment.subject.timeline_events.find_or_create_by!(
          actor: @actor,
          action: :subject_referenced_in_internal_record,
          reference: @subject,
        )
      end
    end

    def sync_notes
      id_to_reject = if @subject.is_a?(Comment)
        @subject.subject.public_id
      else
        @subject.public_id
      end

      previous_linked_note_ids = @subject.extract_note_ids(@changes.first).reject { |id| id == id_to_reject }
      current_linked_note_ids = @subject.extract_note_ids(@changes.last).reject { |id| id == id_to_reject }

      removed_linked_note_ids = previous_linked_note_ids - current_linked_note_ids
      added_linked_note_ids = current_linked_note_ids - previous_linked_note_ids

      removed_referenced_notes = @subject.organization.notes.where(public_id: removed_linked_note_ids)
      added_referenced_notes = @subject.organization.notes.where(public_id: added_linked_note_ids)

      removed_referenced_notes.each do |referenced_note|
        referenced_note.timeline_events.where(action: :subject_referenced_in_internal_record, reference: @subject).destroy_all
      end

      added_referenced_notes.each do |referenced_note|
        referenced_note.timeline_events.find_or_create_by!(
          actor: @actor,
          action: :subject_referenced_in_internal_record,
          reference: @subject,
        )
      end
    end
  end
end
