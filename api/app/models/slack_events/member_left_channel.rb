# frozen_string_literal: true

module SlackEvents
  class MemberLeftChannel < EventCallback
    TYPE = "member_left_channel"

    def handle
      HandleMemberLeftChannelJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      event_params["channel"]
    end
  end
end
