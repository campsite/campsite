# frozen_string_literal: true

class Preference < ApplicationRecord
  SLACK_NOTIFICATIONS = "slack_notifications"
  DISCORD_NOTIFICATIONS = "discord_notifications"

  validates :value,
    inclusion: { in: ["enabled", "disabled"], message: "%{value} is not a valid notification setting" },
    if: -> { key.in?([SLACK_NOTIFICATIONS, DISCORD_NOTIFICATIONS]) }
end
