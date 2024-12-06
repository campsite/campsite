# frozen_string_literal: true

module HmsEvents
  class SessionCloseSuccessEvent < BaseEvent
    TYPE = "session.close.success"

    def handle
      HandleSessionCloseSuccessJob.perform_async(params.to_json)

      { ok: true }
    end

    def session_id
      data["session_id"]
    end

    def session_stopped_at
      data["session_stopped_at"]
    end

    def session_started_at
      data["session_started_at"]
    end

    def room_id
      data["room_id"]
    end
  end
end
