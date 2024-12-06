# frozen_string_literal: true

class TimelineEvent
  class SubjectProjectUpdated
    def initialize(actor:, subject:, changes:)
      @actor = actor
      @subject = subject
      @changes = changes
    end

    def sync
      last_subject_project_updated_timeline_event = @subject.timeline_events.where(action: :subject_project_updated).last

      metadata = if last_subject_project_updated_timeline_event && last_subject_project_updated_timeline_event.created_at > TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago && last_subject_project_updated_timeline_event.actor == @actor
        last_subject_project_updated_timeline_event.destroy!
        {
          from_project_id: last_subject_project_updated_timeline_event.subject_updated_from_project_id,
          to_project_id: @changes.last,
        }
      else
        {
          from_project_id: @changes.first,
          to_project_id: @changes.last,
        }
      end

      # If the rollup results in a loopback, we don't want to create a timeline event
      return if metadata[:from_project_id] == metadata[:to_project_id]

      @subject.timeline_events.create!(
        actor: @actor,
        action: :subject_project_updated,
        metadata: metadata,
      )
    end
  end
end
