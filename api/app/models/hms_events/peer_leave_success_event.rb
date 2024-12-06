# frozen_string_literal: true

module HmsEvents
  class PeerLeaveSuccessEvent < BaseEvent
    TYPE = "peer.leave.success"

    def handle
      HandlePeerLeaveSuccessJob.perform_async(params.to_json)

      { ok: true }
    end

    def peer_id
      data["peer_id"]
    end

    def left_at
      data["left_at"]
    end

    def joined_at
      data["joined_at"]
    end

    def user_id
      data["user_id"]
    end

    def user_name
      data["user_name"]
    end

    def session_id
      data["session_id"]
    end

    def session_started_at
      data["session_started_at"]
    end

    def room_id
      data["room_id"]
    end
  end
end
