# frozen_string_literal: true

require "test_helper"

module Backfills
  class CallRecordingSummarySectionBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "dry run is a no-op" do
        recording = create(:call_recording, :with_transcription)

        CallRecordingSummarySectionBackfill.run

        recording.reload
        assert_empty recording.summary_sections
      end

      it "generates summaries and queues jobs" do
        recording1 = create(:call_recording, :with_transcription)
        recording2 = create(:call_recording, :with_transcription)
        recording2.create_pending_summary_sections!

        assert_not_empty recording2.summary_sections

        expect_sections_count = CallRecordingSummarySection.sections.keys.count

        assert_difference -> { CallRecordingSummarySection.count }, expect_sections_count do
          CallRecordingSummarySectionBackfill.run(dry_run: false)
        end

        recording1.reload
        recording2.reload

        assert_not_empty recording1.summary_sections
        assert_not_empty recording2.summary_sections
        assert_enqueued_sidekiq_jobs(expect_sections_count, only: GenerateCallRecordingSummarySectionJob)
      end

      it "reruns failed sections" do
        recording = create(:call_recording, :with_transcription)
        recording.create_pending_summary_sections!
        failed_section = recording.summary_sections.first
        failed_section.update!(status: :failed)

        assert_not_empty recording.summary_sections
        assert failed_section.failed?

        assert_difference -> { CallRecordingSummarySection.count }, 0 do
          CallRecordingSummarySectionBackfill.run(dry_run: false, failed: true)
        end

        recording.reload
        failed_section.reload

        assert_enqueued_sidekiq_jobs(1, only: GenerateCallRecordingSummarySectionJob)
        assert failed_section.pending?
      end

      it "skips failed sections" do
        recording = create(:call_recording, :with_transcription)
        recording.create_pending_summary_sections!
        failed_section = recording.summary_sections.first
        failed_section.update!(status: :failed)

        assert_not_empty recording.summary_sections
        assert failed_section.failed?

        assert_difference -> { CallRecordingSummarySection.count }, 0 do
          CallRecordingSummarySectionBackfill.run(dry_run: false, failed: false)
        end

        recording.reload

        assert_enqueued_sidekiq_jobs(0, only: GenerateCallRecordingSummarySectionJob)
        assert failed_section.failed?
      end

      it "queues sections based on age" do
        new_recording = create(:call_recording, :with_transcription)
        new_recording.create_pending_summary_sections!
        new_recording.summary_sections.update!(status: :success)

        old_recording = nil
        Timecop.travel(1.hour.ago) do
          old_recording = create(:call_recording, :with_transcription)
          old_recording.create_pending_summary_sections!
          old_recording.summary_sections.update!(status: :success)
        end

        assert new_recording.summary_sections.all?(&:success?)
        assert old_recording.summary_sections.all?(&:success?)

        assert_difference -> { CallRecordingSummarySection.count }, 0 do
          CallRecordingSummarySectionBackfill.run(dry_run: false, failed: false, rerun_from: 30.minutes.ago)
        end

        new_recording.reload
        old_recording.reload

        expect_sections_count = CallRecordingSummarySection.sections.keys.count
        assert_enqueued_sidekiq_jobs(expect_sections_count, only: GenerateCallRecordingSummarySectionJob)

        assert new_recording.summary_sections.all?(&:pending?)
        assert old_recording.summary_sections.all?(&:success?)
      end

      it "skips requeuing sections that are pending" do
        new_recording = create(:call_recording, :with_transcription)
        new_recording.create_pending_summary_sections!

        old_recording = nil
        Timecop.travel(1.hour.ago) do
          old_recording = create(:call_recording, :with_transcription)
          old_recording.create_pending_summary_sections!
          old_recording.summary_sections.update!(status: :success)
        end

        assert new_recording.summary_sections.all?(&:pending?)
        assert old_recording.summary_sections.all?(&:success?)

        assert_difference -> { CallRecordingSummarySection.count }, 0 do
          CallRecordingSummarySectionBackfill.run(dry_run: false, failed: false, rerun_from: 30.minutes.ago)
        end

        new_recording.reload
        old_recording.reload

        # would be queued in prod but simulating that there's no new jobs
        assert_enqueued_sidekiq_jobs(0, only: GenerateCallRecordingSummarySectionJob)

        assert new_recording.summary_sections.all?(&:pending?)
        assert old_recording.summary_sections.all?(&:success?)
      end

      it "does not duplicate jobs" do
        new_recording = create(:call_recording, :with_transcription)
        new_recording.create_pending_summary_sections!
        new_recording.summary_sections.update!(status: :failed)

        old_recording = nil
        Timecop.travel(1.hour.ago) do
          old_recording = create(:call_recording, :with_transcription)
          old_recording.create_pending_summary_sections!
          old_recording.summary_sections.update!(status: :success)
        end

        assert new_recording.summary_sections.all?(&:failed?)
        assert old_recording.summary_sections.all?(&:success?)

        assert_difference -> { CallRecordingSummarySection.count }, 0 do
          CallRecordingSummarySectionBackfill.run(dry_run: false, failed: true, rerun_from: 30.minutes.ago)
        end

        new_recording.reload
        old_recording.reload

        expect_sections_count = CallRecordingSummarySection.sections.keys.count
        assert_enqueued_sidekiq_jobs(expect_sections_count, only: GenerateCallRecordingSummarySectionJob)

        assert new_recording.summary_sections.all?(&:pending?)
        assert old_recording.summary_sections.all?(&:success?)
      end

      it "does not reun on unfinished recordings" do
        recording = create(:call_recording)

        assert_difference -> { CallRecordingSummarySection.count }, 0 do
          CallRecordingSummarySectionBackfill.run(dry_run: false, failed: false, rerun_from: nil)
        end

        recording.reload

        assert_enqueued_sidekiq_jobs(0, only: GenerateCallRecordingSummarySectionJob)
      end

      it "cleans up failed sections on recordings with no transcript" do
        recording = create(:call_recording)
        recording.create_pending_summary_sections!.each { |section| section.update!(status: :failed) }

        assert_difference -> { CallRecordingSummarySection.count }, -3 do
          CallRecordingSummarySectionBackfill.run(dry_run: false, failed: true, rerun_from: nil)
        end

        recording.reload

        assert_enqueued_sidekiq_jobs(0, only: GenerateCallRecordingSummarySectionJob)
        assert_empty recording.summary_sections
      end
    end
  end
end
