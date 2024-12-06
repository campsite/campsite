# frozen_string_literal: true

module EventProcessors
  class ProjectPinDestroyedEventProcessor < ProjectPinBaseEventProcessor
    def process!
      create_subject_unpinned_timeline_event
    end
  end
end
