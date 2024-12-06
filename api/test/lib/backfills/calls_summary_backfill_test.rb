# frozen_string_literal: true

require "test_helper"

module Backfills
  class CallsSummaryBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      before do
        @call_with_recordings = create(:call)
        recording_1 = create(:call_recording, call: @call_with_recordings)
        create(:call_recording_summary_section, call_recording: recording_1, section: :summary, response: "<p>This is the summary</p>")
        create(:call_recording_summary_section, call_recording: recording_1, section: :agenda, response: "<p>This is the agenda</p>")
        create(:call_recording_summary_section, call_recording: recording_1, section: :next_steps, response: "<p>Here are the next steps</p>")
        @call_with_existing_summary = create(:call, summary: "existing summary")
        recording_2 = create(:call_recording, call: @call_with_existing_summary)
        create(:call_recording_summary_section, call_recording: recording_2, section: :summary, response: "<p>This is the summary</p>")
        create(:call_recording_summary_section, call_recording: recording_2, section: :agenda, response: "<p>This is the agenda</p>")
        create(:call_recording_summary_section, call_recording: recording_2, section: :next_steps, response: "<p>Here are the next steps</p>")
        @call_without_recordings = create(:call)
      end

      it "updates calls.summary" do
        CallsSummaryBackfill.run(dry_run: false)

        assert_equal "<p>This is the summary</p><p>This is the agenda</p><h2>Next steps</h2><p>Here are the next steps</p>", @call_with_recordings.reload.summary
        assert_equal "existing summary", @call_with_existing_summary.reload.summary
        assert_nil @call_without_recordings.reload.summary
      end

      it "is a no-op on dry run" do
        CallsSummaryBackfill.run

        assert_nil @call_with_recordings.reload.summary
        assert_equal "existing summary", @call_with_existing_summary.reload.summary
        assert_nil @call_without_recordings.reload.summary
      end
    end
  end
end
