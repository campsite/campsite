# frozen_string_literal: true

class UpdateUserLastSeenAtJob < BaseJob
  sidekiq_options queue: "background"

  def perform(user_id)
    user = User.find(user_id)
    user.update_column(:last_seen_at, Time.current)
    Userlist::Push.users.push(user)
  end
end
