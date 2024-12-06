# frozen_string_literal: true

module SlackEvents
  class MemberJoinedChannel < EventCallback
    TYPE = "member_joined_channel"

    def handle
      HandleMemberJoinedChannelJob.perform_async(params.to_json)
      { ok: true }
    end

    def channel_id
      event_params["channel"]
    end
  end
end
