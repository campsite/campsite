# frozen_string_literal: true

class TimelineEvent
  class SubjectTitleUpdated
    def initialize(actor:, subject:, changes:)
      @actor = actor
      @subject = subject
      @changes = changes
    end

    def sync
      return if @subject.created_at > TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago

      last_title_updated_timeline_event = @subject.timeline_events.where(action: :subject_title_updated).last

      metadata = if last_title_updated_timeline_event && last_title_updated_timeline_event.created_at > TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago && last_title_updated_timeline_event.actor == @actor
        last_title_updated_timeline_event.destroy!
        {
          from_title: last_title_updated_timeline_event.subject_updated_from_title,
          to_title: @changes.last,
        }
      else
        {
          from_title: @changes.first,
          to_title: @changes.last,
        }
      end

      @subject.timeline_events.create!(
        actor: @actor,
        action: :subject_title_updated,
        metadata: metadata,
      )
    end
  end
end
