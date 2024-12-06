# frozen_string_literal: true

module EventProcessors
  class CommentCreatedEventProcessor < CommentBaseEventProcessor
    def process!
      notify_mentioned_users
      notify_mentioned_apps
      notify_subject_subscribers
      comment.subject.try(:update_last_activity_at_column)
      trigger_posts_stale_event
      trigger_new_comment_webhook_event
      sync_internal_reference_timeline_events
    end
  end
end
