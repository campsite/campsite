# frozen_string_literal: true

class DeleteNotificationSlackMessageJob < BaseJob
  sidekiq_options queue: "default", retry: 3

  def perform(id)
    Notification.find(id).delete_slack_message!
  end
end
