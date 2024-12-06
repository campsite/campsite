# frozen_string_literal: true

require "test_helper"

class CallHealthJobTest < ActiveJob::TestCase
  setup do
    @call = create(
      :call,
      :with_summary,
      started_at: (CallHealthJob::PERMITTED_PROCESSING_TIME + 1.hour).ago,
      stopped_at: (CallHealthJob::PERMITTED_PROCESSING_TIME + 1.minute).ago,
    )
  end

  context "#perform" do
    test "reports to Sentry when recording is stuck processing" do
      create(:call_recording, file_path: nil, call: @call)
      Sentry.expects(:capture_message)

      CallHealthJob.new.perform
    end

    test "reports to Sentry when transcript is stuck processing" do
      create(:call_recording, :with_file, :transcription_in_progress, call: @call)
      Sentry.expects(:capture_message)

      CallHealthJob.new.perform
    end

    test "reports to Sentry when summary is stuck processing" do
      create(:call_recording, :with_file, :with_transcription, call: @call)
      @call.update!(summary: nil)
      Sentry.expects(:capture_message)

      CallHealthJob.new.perform
    end

    test "does not report to Sentry when very recent call is still processing" do
      create(:call_recording, file_path: nil, call: @call)
      @call.update!(stopped_at: (CallHealthJob::PERMITTED_PROCESSING_TIME - 1.minute).ago)
      Sentry.expects(:capture_message).never

      CallHealthJob.new.perform
    end

    test "does not report to Sentry when call is processed" do
      create(:call_recording, :with_file, :with_transcription, call: @call)
      Sentry.expects(:capture_message).never

      CallHealthJob.new.perform
    end
  end
end
