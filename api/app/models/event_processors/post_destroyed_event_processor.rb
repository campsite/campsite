# frozen_string_literal: true

module EventProcessors
  class PostDestroyedEventProcessor < PostBaseEventProcessor
    def process!
      post.notifications.discard_all
      post.follow_ups.destroy_all
      post.favorites.destroy_all
      post.notifications.each(&:delete_slack_message_later)

      post.pin&.discard_by_actor(event.actor)

      update_project_activity

      trigger_posts_stale_event
      trigger_project_memberships_stale_events

      remove_subject_internal_reference_timeline_events
    end
  end
end
