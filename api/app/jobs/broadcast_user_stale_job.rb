# frozen_string_literal: true

class BroadcastUserStaleJob < BaseJob
  sidekiq_options queue: "default", retry: 3

  def perform(user_id)
    user = User.find_by(id: user_id)
    return unless user

    user.organizations.each do |org|
      PusherTriggerJob.perform_async(org.channel_name, "user-stale", { user: UserSerializer.render_as_hash(user) }.to_json)
    end
  end
end
