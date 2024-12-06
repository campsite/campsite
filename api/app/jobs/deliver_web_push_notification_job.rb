# frozen_string_literal: true

class DeliverWebPushNotificationJob < BaseJob
  sidekiq_options queue: "default", retry: 3

  def perform(notification_id, web_push_subscription_id)
    notification = Notification.find(notification_id)
    subscription = WebPushSubscription
      .eager_load(:user)
      .find(web_push_subscription_id)

    message = {
      title: notification.summary_text,
      body: notification.body_preview,
      app_badge_count: subscription.user.unread_notifications_count,
      target_url: notification.subject.url,
    }

    subscription.deliver!(message)
  end
end
