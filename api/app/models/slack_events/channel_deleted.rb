# frozen_string_literal: true

module SlackEvents
  class ChannelDeleted < EventCallback
    TYPE = "channel_deleted"

    def handle
      HandleChannelDeletedJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      event_params["channel"]
    end
  end
end
