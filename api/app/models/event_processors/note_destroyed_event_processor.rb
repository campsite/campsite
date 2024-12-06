# frozen_string_literal: true

module EventProcessors
  class NoteDestroyedEventProcessor < NoteBaseEventProcessor
    def process!
      note.follow_ups.destroy_all
      note.favorites.destroy_all
      note.pin&.discard_by_actor(event.actor)
      Notification.where(target: note).discard_all

      remove_subject_internal_reference_timeline_events
    end
  end
end
