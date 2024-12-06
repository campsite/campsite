# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandleTranscriptionSuccessJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/transcription_success_event_payload.json").read)
      @recording = create(:call_recording, remote_transcription_id: @params.dig("data", "transcription_id"))
    end

    context "perform" do
      test "updates CallRecording and triggers client message updates" do
        Timecop.freeze do
          HandleTranscriptionSuccessJob.new.perform(@params.to_json)

          @recording.reload
          assert_equal "prefix/<transcript-json-address>.json", @recording.transcript_json_file_path
          assert_equal "prefix/<transcript-srt-address>.srt", @recording.transcript_srt_file_path
          assert_equal "prefix/<transcript-txt-address>.txt", @recording.transcript_txt_file_path
          assert_in_delta Time.zone.parse(@params.dig("data", "metadata_timestamp")), @recording.transcription_succeeded_at, 2.seconds
          assert_enqueued_sidekiq_job(ProcessCallRecordingTranscriptionJob, args: [@recording.id])
        end
      end

      test "updates CallRecording with matching recording ID if no CallRecording with matching transcription ID" do
        Timecop.freeze do
          @recording.update!(remote_transcription_id: nil, remote_recording_id: @params.dig("data", "recording_id"))

          HandleTranscriptionSuccessJob.new.perform(@params.to_json)

          assert_equal @params.dig("data", "transcription_id"), @recording.reload.remote_transcription_id
          assert_equal "prefix/<transcript-json-address>.json", @recording.transcript_json_file_path
          assert_equal "prefix/<transcript-srt-address>.srt", @recording.transcript_srt_file_path
          assert_equal "prefix/<transcript-txt-address>.txt", @recording.transcript_txt_file_path
          assert_in_delta Time.zone.parse(@params.dig("data", "metadata_timestamp")), @recording.transcription_succeeded_at, 2.seconds
          assert_enqueued_sidekiq_job(ProcessCallRecordingTranscriptionJob, args: [@recording.id])
        end
      end

      test "no-ops if no CallRecording matching transcription ID or recording ID" do
        @recording.update!(remote_transcription_id: nil, remote_recording_id: nil)

        assert_nothing_raised do
          HandleTranscriptionSuccessJob.new.perform(@params.to_json)
        end
      end
    end
  end
end
