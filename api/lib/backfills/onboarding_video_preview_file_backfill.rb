# frozen_string_literal: true

module Backfills
  class OnboardingVideoPreviewFileBackfill
    def self.run(dry_run: true)
      onboarding_video_1_attachments = Attachment.where(file_path: "onboarding/rafa-1.mp4", preview_file_path: nil)
      onboarding_video_2_attachments = Attachment.where(file_path: "onboarding/rafa-4.mp4", preview_file_path: nil)
      count = onboarding_video_1_attachments.count + onboarding_video_2_attachments.count

      onboarding_video_1_attachments.update_all(preview_file_path: "onboarding/rafa-1.png") unless dry_run
      onboarding_video_2_attachments.update_all(preview_file_path: "onboarding/rafa-4.png") unless dry_run

      "#{dry_run ? "Would have updated" : "Updated"} #{count} Attachment #{"record".pluralize(count)}"
    end
  end
end
