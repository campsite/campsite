# frozen_string_literal: true

module EventProcessors
  class CommentBaseEventProcessor < BaseEventProcessor
    alias_method :comment, :subject
    delegate :subscribers, :subscriptions, :parent, :organization, to: :comment

    private

    def notify_subject_subscribers
      subscribers.each do |subscribed_user|
        next if comment.user == subscribed_user

        create_notification!(reason: :parent_subscription, user: subscribed_user)
      end
    end

    def notify_mentioned_users
      new_user_mentions.each do |mentioned_user|
        next if comment.user == mentioned_user

        subscribe_user_to_subject(mentioned_user)
        create_notification!(reason: :mention, user: mentioned_user)
      end
    end

    def notify_mentioned_apps
      return unless comment.subject.is_a?(Post)

      new_app_mentions.each do |mentioned_app|
        next if comment.author == mentioned_app

        WebhookEvents::AppMentioned.new(subject: comment, oauth_application: mentioned_app).call
      end
    end

    def notify_resolved_users
      # prevent renotifying resolved changes when other changes are made
      resolved_at_changes = subject_previous_changes[:resolved_at]
      return if resolved_at_changes.blank?

      return if comment.reply?

      was_resolved = subject_previous_changes[:resolved_at]&.first.present?
      if !was_resolved && comment.resolved? && comment.member != comment.resolved_by
        create_notification!(reason: :comment_resolved, user: comment.user)
      elsif was_resolved && !comment.resolved?
        comment.notifications.where(reason: :comment_resolved).discard_all
      end
    end

    def create_notification!(reason:, user:)
      return if event.skip_notifications? || !Pundit.policy!(user, comment).show? || notified_user_ids.include?(user.id)

      notification = event.notifications.create!(
        reason: reason,
        organization_membership: user.kept_organization_memberships.find_by!(organization: organization),
        target: comment.subject,
      )

      notification.deliver_email_later
      notification.deliver_slack_message_later
      notification.deliver_web_push_notification_later

      notified_user_ids.add(user.id)
    end

    def trigger_posts_stale_event
      return unless comment.subject.is_a?(Post)

      post = comment.subject
      return if event.skip_notifications?

      event_payload = {
        user_id: post.user&.public_id,
        username: post.user&.username,
        project_ids: [post.project&.public_id].compact,
        tag_names: post.tags.map(&:name),
      }.to_json

      PusherTriggerJob.perform_async(organization.channel_name, "posts-stale", event_payload)
    end

    def trigger_new_comment_webhook_event
      return unless comment.subject.is_a?(Post)

      WebhookEvents::CommentCreated.new(comment: comment).call
    end

    def subscribe_user_to_subject(user)
      return unless Pundit.policy!(user, comment).show?

      subscriptions.create_or_find_by!(user: user)
    end

    def sync_internal_reference_timeline_events
      body_html_changes = subject_previous_changes[:body_html]
      return if body_html_changes.blank?

      TimelineEvent::SubjectReferencedInInternalRecord.new(actor: event.actor, subject: comment, changes: body_html_changes).sync
    end

    def remove_subject_internal_reference_timeline_events
      TimelineEvent.where(action: :subject_referenced_in_internal_record, reference: comment).destroy_all
    end
  end
end
