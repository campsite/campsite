# frozen_string_literal: true

class SchedulePostDigestNotificationJobs < BaseJob
  sidekiq_options queue: "background"

  def perform
    ScheduledNotification.post_digests.schedulable_in(30.minutes).in_batches do |notifications|
      notifications.each do |notification|
        interval = calculate_interval(notification)
        UserPostDigestNotificationJob.perform_in(interval, notification.id)
      end
    end
  end

  private

  def calculate_interval(notification)
    time_zone = ActiveSupport::TimeZone.new(notification.time_zone)
    now = Time.current.in_time_zone(time_zone.name)
    delivery_time = notification.delivery_time.change(
      year: now.year,
      month: now.month,
      day: now.day,
      offset: time_zone.utc_offset.zero? ? nil : time_zone.utc_offset,
    )
    diff = delivery_time - now
    diff = 0 if diff < 0
    diff.round.seconds
  end
end
