# frozen_string_literal: true

module EventProcessors
  class CommentDestroyedEventProcessor < CommentBaseEventProcessor
    def process!
      comment.notifications.discard_all
      comment.follow_ups.destroy_all
      comment.notifications.each(&:delete_slack_message_later)
      comment.subject.try(:update_last_activity_at_column)
      comment.maybe_unresolve_post!(actor: event.actor)
      trigger_posts_stale_event
      remove_subject_internal_reference_timeline_events
    end
  end
end
