# frozen_string_literal: true

module HmsEvents
  class BeamStartedSuccessEvent < BaseEvent
    TYPE = "beam.started.success"

    def handle
      HandleBeamStartedSuccessJob.perform_async(params.to_json)

      { ok: true }
    end

    def session_id
      data["session_id"]
    end

    def beam_id
      data["beam_id"]
    end

    def job_id
      data["job_id"]
    end

    def started_at
      data["metadata_timestamp"]
    end

    def room_id
      data["room_id"]
    end

    def session_started_at
      data["session_started_at"]
    end
  end
end
