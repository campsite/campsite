# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandleTranscriptionStartedSuccessJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/transcription_started_success_event_payload.json").read)
      @recording = create(:call_recording, remote_recording_id: @params.dig("data", "recording_id"))
      @message = create(:message, call: @recording.call)
    end

    context "perform" do
      test "updates CallRecording" do
        Timecop.freeze do
          HandleTranscriptionStartedSuccessJob.new.perform(@params.to_json)

          assert_in_delta Time.zone.parse(@params.dig("data", "metadata_timestamp")), @recording.reload.transcription_started_at, 2.seconds
          assert_equal @params.dig("data", "transcription_id"), @recording.remote_transcription_id
          assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@message.sender.id, @message.id, "update-message"])
        end
      end

      test "works for subjectless call with logged-out peer" do
        call = create(:call, :in_subjectless_room, remote_session_id: @params.dig("data", "session_id"))
        create(:call_peer, :active, call: call, organization_membership: nil)
        @recording.update!(call: call)

        Timecop.freeze do
          HandleTranscriptionStartedSuccessJob.new.perform(@params.to_json)

          assert_in_delta Time.zone.parse(@params.dig("data", "metadata_timestamp")), @recording.reload.transcription_started_at, 2.seconds
          assert_equal @params.dig("data", "transcription_id"), @recording.remote_transcription_id
          refute_enqueued_sidekiq_job(InvalidateMessageJob)
        end
      end

      test "no-op if recording has already been destroyed" do
        @recording.destroy!

        assert_nothing_raised do
          HandleTranscriptionStartedSuccessJob.new.perform(@params.to_json)
        end
      end
    end
  end
end
