# frozen_string_literal: true

module EventProcessors
  class CommentUpdatedEventProcessor < CommentBaseEventProcessor
    def process!
      notify_mentioned_users
      notify_mentioned_apps
      notify_resolved_users
      sync_internal_reference_timeline_events
    end
  end
end
