# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandleBeamStoppedSuccessJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/beam_stopped_success_event_payload.json").read)
      @recording = create(:call_recording, remote_beam_id: @params.dig("data", "beam_id"))
    end

    context "perform" do
      test "updates CallRecording" do
        HandleBeamStoppedSuccessJob.new.perform(@params.to_json)

        assert_in_delta Time.zone.parse(@params.dig("data", "metadata_timestamp")), @recording.reload.stopped_at, 2.seconds
      end
    end
  end
end
