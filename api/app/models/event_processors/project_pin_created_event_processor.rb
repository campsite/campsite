# frozen_string_literal: true

module EventProcessors
  class ProjectPinCreatedEventProcessor < ProjectPinBaseEventProcessor
    def process!
      create_subject_pinned_timeline_event
    end
  end
end
