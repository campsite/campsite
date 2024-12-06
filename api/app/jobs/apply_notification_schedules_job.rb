# frozen_string_literal: true

class ApplyNotificationSchedulesJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform
    NotificationSchedule.needs_applying.find_each(&:apply!)
  end
end
