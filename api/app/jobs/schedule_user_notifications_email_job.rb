# frozen_string_literal: true

class ScheduleUserNotificationsEmailJob < BaseJob
  sidekiq_options queue: "background"

  def perform(user_id, notification_created_at_string)
    user = User.find(user_id)
    notification_created_at = Time.zone.parse(notification_created_at_string)

    # matches a user that doesn't have notifications currently queued
    # this batches and throttles notification emails to one per 15 minutes
    return if user.scheduled_email_notifications_from.present? && user.scheduled_email_notifications_from > UserNotificationsEmailJob::BUNDLE_DURATION.ago

    # use the notification's time to set the lookback window
    user.update!(scheduled_email_notifications_from: notification_created_at)

    UserNotificationsEmailJob.perform_in(UserNotificationsEmailJob::BUNDLE_DURATION.from_now, user.id)
  end
end
