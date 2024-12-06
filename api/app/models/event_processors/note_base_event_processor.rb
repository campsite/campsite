# frozen_string_literal: true

module EventProcessors
  class NoteBaseEventProcessor < BaseEventProcessor
    alias_method :note, :subject
    delegate :timeline_events, to: :note

    def sync_project_updated_timeline_event
      project_changes = subject_previous_changes[:project_id]
      return if project_changes.blank?

      TimelineEvent::SubjectProjectUpdated.new(actor: event.actor, subject: note, changes: project_changes).sync
    end

    def sync_internal_reference_timeline_events
      description_html_changes = subject_previous_changes[:description_html]
      return if description_html_changes.blank?

      TimelineEvent::SubjectReferencedInInternalRecord.new(actor: event.actor, subject: note, changes: description_html_changes).sync
    end

    def sync_title_updated_timeline_event
      title_changes = subject_previous_changes[:title]
      return if title_changes.blank?

      TimelineEvent::SubjectTitleUpdated.new(actor: event.actor, subject: note, changes: title_changes).sync
    end

    def remove_subject_internal_reference_timeline_events
      TimelineEvent.where(action: :subject_referenced_in_internal_record, reference: note).destroy_all
    end
  end
end
