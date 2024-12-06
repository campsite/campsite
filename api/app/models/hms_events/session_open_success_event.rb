# frozen_string_literal: true

module HmsEvents
  class SessionOpenSuccessEvent < BaseEvent
    TYPE = "session.open.success"

    def handle
      HandleSessionOpenSuccessJob.perform_async(params.to_json)

      { ok: true }
    end

    def room_id
      data["room_id"]
    end

    def session_id
      data["session_id"]
    end

    def session_started_at
      data["session_started_at"]
    end
  end
end
