# frozen_string_literal: true

require "test_helper"

module Backfills
  class CallsRecordingsDurationBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      before do
        @call_with_recordings = create(:call)
        create(:call_recording, call: @call_with_recordings, duration: 10)
        create(:call_recording, call: @call_with_recordings, duration: 20)
        @call_without_recordings = create(:call)
        create(:call_recording, duration: 30)
        @call_with_recording_with_nil_duration = create(:call)
        started_at = Time.zone.parse("2024-01-01 00:00:00")
        create(:call_recording, call: @call_with_recording_with_nil_duration, duration: nil, started_at: started_at, stopped_at: started_at + 40.seconds)
      end

      it "updates calls.recording_duration" do
        CallsRecordingsDurationBackfill.run(dry_run: false)

        assert_equal 30, @call_with_recordings.reload.recordings_duration
        assert_equal 0, @call_without_recordings.reload.recordings_duration
        assert_equal 40, @call_with_recording_with_nil_duration.reload.recordings_duration
      end

      it "is a no-op on dry run" do
        CallsRecordingsDurationBackfill.run

        assert_equal 0, @call_with_recordings.reload.recordings_duration
        assert_equal 0, @call_without_recordings.reload.recordings_duration
        assert_equal 0, @call_with_recording_with_nil_duration.reload.recordings_duration
      end
    end
  end
end
