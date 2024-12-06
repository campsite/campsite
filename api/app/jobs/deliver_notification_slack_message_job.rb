# frozen_string_literal: true

class DeliverNotificationSlackMessageJob < BaseJob
  sidekiq_options queue: "default", retry: 3

  def perform(id)
    Notification.find(id).deliver_slack_message!
  end
end
