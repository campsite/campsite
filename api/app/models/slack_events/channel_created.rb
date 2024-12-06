# frozen_string_literal: true

module SlackEvents
  class ChannelCreated < EventCallback
    TYPE = "channel_created"

    def handle
      HandleChannelCreatedJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      event_params.dig("channel", "id")
    end
  end
end
