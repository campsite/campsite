# frozen_string_literal: true

class PusherTriggerJob < BaseJob
  sidekiq_options queue: "critical", retry: 3

  def perform(channel, event, data)
    Pusher.trigger(
      channel,
      event,
      JSON.parse(data, symbolize_names: true),
      { socket_id: Current.pusher_socket_id }.compact,
    )
  end
end
