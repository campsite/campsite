# frozen_string_literal: true

class Preference < ApplicationRecord
  SLACK_NOTIFICATIONS = "slack_notifications"

  validates :value,
    inclusion: { in: ["enabled", "disabled"], message: "%{value} is not a valid email notification setting" },
    if: -> { key == SLACK_NOTIFICATIONS }
end
