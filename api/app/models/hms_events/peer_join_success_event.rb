# frozen_string_literal: true

module HmsEvents
  class PeerJoinSuccessEvent < BaseEvent
    TYPE = "peer.join.success"

    def handle
      HandlePeerJoinSuccessJob.perform_async(params.to_json)

      { ok: true }
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

    def peer_id
      data["peer_id"]
    end

    def joined_at
      data["joined_at"]
    end

    def room_id
      data["room_id"]
    end

    def session_started_at
      data["session_started_at"]
    end
  end
end
