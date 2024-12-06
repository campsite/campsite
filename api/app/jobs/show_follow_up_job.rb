# frozen_string_literal: true

class ShowFollowUpJob < BaseJob
  sidekiq_options queue: "default"

  def perform(follow_up_id)
    follow_up = FollowUp.find_by(id: follow_up_id)
    return if !follow_up || !follow_up.needs_showing?

    follow_up.show!
  end
end
