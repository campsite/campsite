# frozen_string_literal: true

class SetUserPreferredTimezoneJob < BaseJob
  sidekiq_options queue: "background"

  def perform(user_id, timezone)
    user = User.find_by(id: user_id)
    return unless user

    user.update(preferred_timezone: timezone)
  end
end
