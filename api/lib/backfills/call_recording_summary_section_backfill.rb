# frozen_string_literal: true

module Backfills
  class CallRecordingSummarySectionBackfill
    def self.run(dry_run: true, rerun_from: nil, failed: false)
      updated_count = 0
      rerun_failed_count = 0
      rerun_from_count = 0
      running_delay = 0.seconds
      missing_transcript_deleted = 0

      processed_ids = []

      CallRecording.where.missing(:summary_sections).find_each do |recording|
        next if recording.stopped_at.nil?

        recording.generate_summary_sections(delay: running_delay) unless dry_run
        running_delay += 20.seconds

        updated_count += 1
      end

      if failed
        scope = CallRecordingSummarySection.where(status: :failed)
        if processed_ids.any?
          scope = scope.where.not("id in (?)", processed_ids)
        end
        scope.find_each do |section|
          if section.call_recording.formatted_transcript.blank?
            section.destroy unless dry_run
            missing_transcript_deleted += 1
          else
            GenerateCallRecordingSummarySectionJob.perform_in(running_delay, section.id) unless dry_run
            running_delay += 20.seconds
            processed_ids << section.id

            rerun_failed_count += 1
          end
        end
        scope.update_all(status: :pending) unless dry_run
      end

      if rerun_from
        scope = CallRecordingSummarySection.where("created_at > ?", rerun_from).where.not(status: :pending)
        if processed_ids.any?
          scope = scope.where.not("id in (?)", processed_ids)
        end
        scope.find_each do |section|
          GenerateCallRecordingSummarySectionJob.perform_in(running_delay, section.id) unless dry_run
          running_delay += 20.seconds

          rerun_from_count += 1
        end
        scope.update_all(status: :pending) unless dry_run
      end

      [
        "#{dry_run ? "Would have started" : "Started"} #{updated_count} #{"recording summary".pluralize(updated_count)}",
        "rerun #{rerun_failed_count} failed",
        " rerun #{rerun_from_count} from #{rerun_from}",
        "destroyed #{missing_transcript_deleted} missing transcript sections",
      ].join(", ")
    end
  end
end
