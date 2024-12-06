# frozen_string_literal: true

module EventProcessors
  class ProjectPinBaseEventProcessor < BaseEventProcessor
    alias_method :project_pin, :subject
    delegate :subject, to: :project_pin

    private

    def create_subject_pinned_timeline_event
      last_subject_unpinned_timeline_event = subject.timeline_events.where(action: :subject_unpinned).last
      if last_subject_unpinned_timeline_event && last_subject_unpinned_timeline_event.created_at > TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago && last_subject_unpinned_timeline_event.actor == event.actor
        last_subject_unpinned_timeline_event.destroy!
        return
      end

      subject.timeline_events.create!(actor: event.actor, action: :subject_pinned)
    end

    def create_subject_unpinned_timeline_event
      last_subject_pinned_timeline_event = subject.timeline_events.where(action: :subject_pinned).last
      if last_subject_pinned_timeline_event && last_subject_pinned_timeline_event.created_at > TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago && last_subject_pinned_timeline_event.actor == event.actor
        last_subject_pinned_timeline_event.destroy!
        return
      end

      subject.timeline_events.create!(actor: event.actor, action: :subject_unpinned)
    end
  end
end
