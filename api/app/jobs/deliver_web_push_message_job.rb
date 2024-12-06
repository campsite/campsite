# frozen_string_literal: true

class DeliverWebPushMessageJob < BaseJob
  sidekiq_options queue: "critical", retry: 3

  def perform(message_id, web_push_subscription_id, to_member_id, ignore_pause = false)
    to_member = OrganizationMembership.kept.find(to_member_id)

    message = Message
      .eager_load(:reply_to)
      .preload(message_thread: :owner)
      .find(message_id)

    return if message.discarded?
    return if message.skip_push?(to_member: to_member, ignore_pause: ignore_pause)

    subscription = WebPushSubscription
      .eager_load(:user)
      .find_by(id: web_push_subscription_id)

    return if subscription.nil?

    message = {
      title: message.message_thread.formatted_title(to_member),
      body: message.preview_truncated(viewer: to_member),
      app_badge_count: subscription.user.unread_notifications_count,
      target_url: message.message_thread.url,
    }

    subscription.deliver!(message)
  end
end

DeliverWebPushMessageJob2 = DeliverWebPushMessageJob
