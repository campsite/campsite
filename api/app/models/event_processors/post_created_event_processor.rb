# frozen_string_literal: true

module EventProcessors
  class PostCreatedEventProcessor < PostBaseEventProcessor
    def process!
      notify_all_mentioned_users
      notify_all_mentioned_apps
      notify_parent_subscribers
      notify_project_subscribers
      subscribe_cascading_project_subscribers

      update_project_activity
      create_slack_message

      trigger_new_post_event
      trigger_new_post_in_project_event
      trigger_new_post_webhook_event
      trigger_posts_stale_event
      trigger_project_memberships_stale_events
      trigger_system_messages

      sync_internal_reference_timeline_events
      sync_unfurled_link_internal_reference_timeline_event
    end
  end
end
