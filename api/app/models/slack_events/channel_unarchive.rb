# frozen_string_literal: true

module SlackEvents
  class ChannelUnarchive < EventCallback
    TYPE = "channel_unarchive"

    def handle
      HandleChannelUnarchiveJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      event_params["channel"]
    end
  end
end
