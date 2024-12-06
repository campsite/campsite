# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandleTranscriptionFailureJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/transcription_failure_event_payload.json").read)
      @recording = create(:call_recording, remote_transcription_id: @params.dig("data", "transcription_id"))
    end

    context "perform" do
      test "updates CallRecording" do
        Timecop.freeze do
          HandleTranscriptionFailureJob.new.perform(@params.to_json)

          assert_in_delta Time.zone.parse(@params.dig("data", "metadata_timestamp")), @recording.reload.transcription_failed_at, 2.seconds
        end
      end

      test "no-ops if no CallRecording with matching transcription ID" do
        @recording.destroy!

        assert_nothing_raised do
          HandleTranscriptionFailureJob.new.perform(@params.to_json)
        end
      end
    end
  end
end
