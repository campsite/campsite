# frozen_string_literal: true

module SlackEvents
  class GroupLeft < EventCallback
    TYPE = "group_left"

    def handle
      HandleGroupLeftJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      event_params["channel"]
    end
  end
end
