# frozen_string_literal: true

module EventProcessors
  class PostFeedbackRequestBaseEventProcessor < BaseEventProcessor
    alias_method :post_feedback_request, :subject
    delegate :member, :post, to: :post_feedback_request

    def notify_feedback_requested_user
      return if !Pundit.policy!(member.user, post).show? || post.member == member || post_feedback_request.dismissed?

      notification = event.notifications.feedback_requested.create!(
        organization_membership: member,
        target: post,
      )

      notification.deliver_email_later
      notification.deliver_slack_message_later
      notification.deliver_web_push_notification_later
    end
  end
end
