# frozen_string_literal: true

module HmsEvents
  class HandleBeamStartedSuccessJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = BeamStartedSuccessEvent.new(JSON.parse(payload))

      Call.create_or_find_by_hms_event!(event).recordings.create!(
        remote_beam_id: event.beam_id,
        remote_job_id: event.job_id,
        started_at: event.started_at,
      )
    end
  end
end
