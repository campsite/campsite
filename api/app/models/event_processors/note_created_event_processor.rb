# frozen_string_literal: true

module EventProcessors
  class NoteCreatedEventProcessor < NoteBaseEventProcessor
    def process!
      note.update_content_updated_at_column

      sync_internal_reference_timeline_events
    end
  end
end
