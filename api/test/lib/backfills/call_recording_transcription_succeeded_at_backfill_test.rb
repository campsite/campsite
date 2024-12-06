# frozen_string_literal: true

require "test_helper"

module Backfills
  class CallRecordingTranscriptionSucceededAtBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      setup do
        @call_recording_missing_succeeded_at = create(:call_recording, transcript_srt_file_path: "/foobar", transcription_succeeded_at: nil)
        @succeeded_at = 5.minutes.ago
        @call_recording_with_succeeded_at = create(:call_recording, transcript_srt_file_path: "/foobar", transcription_succeeded_at: @succeeded_at)
        @call_recording_not_transcribed = create(:call_recording, transcript_srt_file_path: nil, transcription_succeeded_at: nil)
      end

      it "backfills call recordings missing succeeded_at" do
        Timecop.freeze do
          CallRecordingTranscriptionSucceededAtBackfill.run(dry_run: false)

          @call_recording_missing_succeeded_at.reload
          @call_recording_with_succeeded_at.reload
          @call_recording_not_transcribed.reload

          assert_in_delta @call_recording_missing_succeeded_at.updated_at, @call_recording_missing_succeeded_at.transcription_succeeded_at, 2.seconds
          assert_in_delta @succeeded_at, @call_recording_with_succeeded_at.transcription_succeeded_at, 2.seconds
          assert_nil @call_recording_not_transcribed.transcription_succeeded_at
        end
      end

      it "dry-run is a no-op" do
        CallRecordingTranscriptionSucceededAtBackfill.run

        @call_recording_missing_succeeded_at.reload
        @call_recording_with_succeeded_at.reload
        @call_recording_not_transcribed.reload

        assert_nil @call_recording_missing_succeeded_at.transcription_succeeded_at
        assert_in_delta @succeeded_at, @call_recording_with_succeeded_at.transcription_succeeded_at, 2.seconds
        assert_nil @call_recording_not_transcribed.transcription_succeeded_at
      end
    end
  end
end
