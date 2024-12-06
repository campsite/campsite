# frozen_string_literal: true

module EventProcessors
  class PostBaseEventProcessor < BaseEventProcessor
    include ActionView::Helpers::UrlHelper

    alias_method :post, :subject
    delegate :parent,
      :project,
      :tags,
      :organization,
      :user,
      :description_html,
      :feedback_requests,
      :timeline_events,
      to: :post

    private

    def notify_parent_subscribers
      return unless parent

      parent.subscribers.eager_load(:kept_organization_memberships).each do |parent_subscriber|
        create_notification!(reason: :parent_subscription, user: parent_subscriber)
      end
    end

    def notify_project_subscribers
      return unless project

      project_subscriptions.each do |project_subscription|
        create_notification!(reason: :project_subscription, user: project_subscription.user)
      end
    end

    def subscribe_cascading_project_subscribers
      return unless project

      project_subscriptions.each do |project_subscription|
        next unless project_subscription.cascade?

        subscribe_user(project_subscription.user)
      end
    end

    def project_subscriptions
      return @project_subscriptions if defined?(@project_subscriptions)

      @project_subscriptions = project&.subscriptions&.eager_load(user: :kept_organization_memberships)
    end

    def notify_all_mentioned_users
      return if description_html.blank?

      all_user_mentions.eager_load(:kept_organization_memberships).each do |mentioned_user|
        subscribe_user(mentioned_user)
        create_notification!(reason: :mention, user: mentioned_user)
      end
    end

    def notify_newly_mentioned_users
      return if description_html.blank?

      new_user_mentions.eager_load(:kept_organization_memberships).each do |mentioned_user|
        subscribe_user(mentioned_user)
        create_notification!(reason: :mention, user: mentioned_user)
      end
    end

    def notify_all_mentioned_apps
      all_app_mentions.each do |mentioned_app|
        WebhookEvents::AppMentioned.new(subject: post, oauth_application: mentioned_app).call
      end
    end

    def notify_newly_mentioned_apps
      new_app_mentions.each do |mentioned_app|
        WebhookEvents::AppMentioned.new(subject: post, oauth_application: mentioned_app).call
      end
    end

    def subscribe_user(user)
      return unless Pundit.policy!(user, post).show?

      post.subscriptions.create_or_find_by!(user: user)
    end

    def create_notification!(reason:, user:, organization_membership: nil, skip_if_author: true)
      return if event.skip_notifications?
      return if skip_if_author && post.user == user
      return unless Pundit.policy!(user, post).show?
      return if feedback_users.include?(user)
      return if notified_user_ids.include?(user.id)

      notification = event.notifications.create!(
        reason: reason,
        organization_membership: organization_membership || user.kept_organization_memberships.find_by!(organization: organization),
        target: post,
      )

      notification.deliver_email_later
      notification.deliver_slack_message_later
      notification.deliver_web_push_notification_later

      notified_user_ids.add(user.id)
    end

    def feedback_users
      @feedback_users ||= post.kept_feedback_requests.map(&:user)
    end

    def trigger_posts_stale_event
      return if event.skip_notifications? || post.draft?

      event_payload = {
        user_id: user&.public_id,
        username: user&.username,
        project_ids: [project&.public_id, previous_project&.public_id].compact.uniq,
        tag_names: tags.map(&:name),
      }.to_json

      PusherTriggerJob.perform_async(organization.channel_name, "posts-stale", event_payload)
    end

    def trigger_project_memberships_stale_events
      return if event.skip_notifications || post.draft?

      [post.project, previous_project].compact.uniq.each do |project|
        project.kept_project_memberships.each do |project_membership|
          project_membership.trigger_project_memberships_stale_event
        end
      end
    end

    def update_project_activity
      return if post.draft?

      project&.update_last_activity_at_column
      previous_project&.update_last_activity_at_column
    end

    def create_slack_message
      return if event.skip_notifications? || post.draft?
      return unless Flipper.enabled?(:slack_auto_publish, post.member&.user) || Flipper.enabled?(:slack_auto_publish, post.organization)

      CreateSlackMessageJob.perform_async(post.id)
    end

    def organization_memberships_for_pusher_event
      scope = OrganizationMembership.left_outer_joins(:member_favorites, :project_memberships).excluding(post.member)

      scope
        .where(favorites: { favoritable: post.project })
        .or(scope.where(project_memberships: { project: post.project, discarded_at: nil }))
        .distinct
    end

    def trigger_new_post_in_project_event
      return if event.skip_notifications? || post.draft?
      return unless post.project

      organization_memberships_for_pusher_event.each do |organization_membership|
        PusherTriggerJob.perform_async(
          organization_membership.user.channel_name,
          "new-post-in-project",
          { project_id: post.project.public_id }.to_json,
        )
      end
    end

    def trigger_new_post_event
      return if event.skip_notifications? || post.draft?

      PusherTriggerJob.perform_async(
        organization.channel_name,
        "new-post",
        { post_id: post.public_id, user_id: user&.public_id }.to_json,
      )
    end

    def trigger_new_post_webhook_event
      WebhookEvents::PostCreated.new(post: post).call
    end

    def trigger_system_messages
      return if post.project.private? || post.draft?
      return unless post.from_message

      InvalidateMessageJob.perform_async(post.member.id, post.from_message.id, "update-message")

      link = link_to(
        "View",
        post.url,
        class: "prose-link text-blue-500",
        data: { truncated: false },
        rel: "noopener",
      )
      message_sender_name = if post.member == post.from_message.sender
        "their"
      elsif post.from_message.sender&.display_name.present?
        "#{post.from_message.sender.display_name}'s"
      else
        "a"
      end
      content = content_tag(
        :p,
        "#{post.user.display_name} created a post from #{message_sender_name} message ⋅ #{link}".html_safe, # rubocop:disable Rails/OutputSafety
      )

      post.from_message.message_thread.send_message!(content: content, system_shared_post: post)
    end

    def previous_project
      return @previous_project if defined?(@previous_project)

      @previous_project ||= begin
        previous_project_id = subject_previous_changes[:project_id]&.first
        return unless previous_project_id

        Project.find(previous_project_id)
      end
    end

    def notify_resolved_users
      resolved_at_changes = subject_previous_changes[:resolved_at]
      return if resolved_at_changes.blank?

      was_resolved = subject_previous_changes[:resolved_at]&.first.present?
      if !was_resolved && post.resolved?
        if post.resolved_comment && post.resolved_by.user != post.resolved_comment.user
          create_notification!(
            reason: :post_resolved_from_comment,
            user: post.resolved_comment.user,
            skip_if_author: false,
          )
        end

        post.subscribers.eager_load(:kept_organization_memberships).each do |subscriber|
          # skip sending notification to the user that resolved the post if they are already subscribed
          next if subscriber == post.resolved_by.user

          create_notification!(reason: :post_resolved, user: subscriber, skip_if_author: false)
        end
      elsif was_resolved && !post.resolved?
        post.notifications.where(reason: [:post_resolved, :post_resolved_from_comment]).discard_all
      end
    end

    def sync_title_updated_timeline_event
      title_changes = subject_previous_changes[:title]
      return if title_changes.blank? || post.draft?

      TimelineEvent::SubjectTitleUpdated.new(actor: event.actor, subject: post, changes: title_changes).sync
    end

    def sync_resolution_updated_timeline_event
      resolved_at_changes = subject_previous_changes[:resolved_at]
      return if resolved_at_changes.blank? || post.draft?

      if post.resolved?
        last_post_unresolved_timeline_event = timeline_events.where(action: :post_unresolved).last

        if last_post_unresolved_timeline_event && last_post_unresolved_timeline_event.created_at > TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago && last_post_unresolved_timeline_event.actor == event.actor
          last_post_unresolved_timeline_event.destroy!
        else
          timeline_events.create!(actor: event.actor, action: :post_resolved)
        end
      else
        last_post_resolved_timeline_event = timeline_events.where(action: :post_resolved).last

        if last_post_resolved_timeline_event && last_post_resolved_timeline_event.created_at > TimelineEvent::ROLLUP_THRESHOLD_SECONDS.ago && last_post_resolved_timeline_event.actor == event.actor
          last_post_resolved_timeline_event.destroy!
        else
          timeline_events.create!(actor: event.actor, action: :post_unresolved)
        end
      end
    end

    def sync_project_updated_timeline_event
      project_changes = subject_previous_changes[:project_id]
      return if project_changes.blank? || post.draft?

      TimelineEvent::SubjectProjectUpdated.new(actor: event.actor, subject: post, changes: project_changes).sync
    end

    def sync_visibility_updated_timeline_event
      visibility_changes = subject_previous_changes[:visibility]
      return if visibility_changes.blank? || post.draft?

      timeline_events.create!(
        actor: event.actor,
        action: :post_visibility_updated,
        metadata: {
          from_visibility: Post.visibilities[visibility_changes.first],
          to_visibility: Post.visibilities[visibility_changes.last],
        },
      )
    end

    def sync_internal_reference_timeline_events(published_event: false)
      # spoof changing from empty to the full description when publishing
      description_html_changes = published_event ? [nil, post.description_html] : subject_previous_changes[:description_html]
      return if description_html_changes.blank? || post.draft?

      TimelineEvent::SubjectReferencedInInternalRecord.new(actor: event.actor, subject: post, changes: description_html_changes).sync
    end

    def sync_unfurled_link_internal_reference_timeline_event
      return if post.unfurled_link.blank? || post.draft?

      TimelineEvent::SubjectReferencedInInternalRecord.new(actor: event.actor, subject: post, changes: ["", post.unfurled_link]).sync
    end

    def remove_subject_internal_reference_timeline_events
      TimelineEvent.where(action: :subject_referenced_in_internal_record, reference: post).destroy_all
    end
  end
end
