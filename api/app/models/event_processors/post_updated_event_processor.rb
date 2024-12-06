# frozen_string_literal: true

module EventProcessors
  class PostUpdatedEventProcessor < PostBaseEventProcessor
    def process!
      notify_newly_mentioned_users
      notify_newly_mentioned_apps
      notify_resolved_users

      sync_resolution_updated_timeline_event
      sync_visibility_updated_timeline_event
      sync_project_updated_timeline_event
      sync_internal_reference_timeline_events
      sync_title_updated_timeline_event

      if subject_previous_changes[:project_id]
        if post.private?
          post.notifications
            .joins(:organization_membership)
            .where.not(organization_membership: post.project.members)
            .discard_all

          FollowUp
            .where(subject: [post, post.comments])
            .joins(:organization_membership)
            .where.not(organization_membership: post.project.members)
            .destroy_all

          Favorite
            .where(favoritable: post)
            .joins(:organization_membership)
            .where.not(organization_membership: post.project.members)
            .destroy_all
        end

        post.pin&.discard_by_actor(event.actor)

        notify_project_subscribers
        subscribe_cascading_project_subscribers

        update_project_activity

        trigger_posts_stale_event
        trigger_project_memberships_stale_events
      end
    end
  end
end
