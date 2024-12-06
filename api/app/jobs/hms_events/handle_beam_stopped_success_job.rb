# frozen_string_literal: true

module HmsEvents
  class HandleBeamStoppedSuccessJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = BeamStoppedSuccessEvent.new(JSON.parse(payload))
      CallRecording.find_by!(remote_beam_id: event.beam_id).update!(stopped_at: event.stopped_at)
    end
  end
end
