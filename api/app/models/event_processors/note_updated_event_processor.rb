# frozen_string_literal: true

module EventProcessors
  class NoteUpdatedEventProcessor < NoteBaseEventProcessor
    def process!
      sync_project_updated_timeline_event
      sync_internal_reference_timeline_events
      sync_title_updated_timeline_event

      allowlisted_fields = [:title, :description_html, :project_id, :visibility, :project_permission]

      if allowlisted_fields.any? { |field| subject_previous_changes.key?(field) }
        note.update_content_updated_at_column
      end

      if subject_previous_changes.key?(:project_id)
        note.pin&.discard_by_actor(event.actor)
      end

      if subject_previous_changes.key?(:project_permission) && note.project_none?
        note.follow_ups.each do |follow_up|
          follow_up.destroy! unless Pundit.policy!(follow_up.user, note).show?
        end

        note.favorites.each do |favorite|
          favorite.destroy! unless Pundit.policy!(favorite.user, note).show?
        end
      end
    end
  end
end
