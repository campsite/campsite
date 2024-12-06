# frozen_string_literal: true

module EventProcessors
  class ProjectPinUpdatedEventProcessor < ProjectPinBaseEventProcessor
    def process!
      return unless subject_restored?

      create_subject_pinned_timeline_event
    end
  end
end
