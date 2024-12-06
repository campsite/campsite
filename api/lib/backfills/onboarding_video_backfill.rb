# frozen_string_literal: true

module Backfills
  class OnboardingVideoBackfill
    def self.run(dry_run: true)
      rafa_1_attachments = Attachment.where(file_path: "onboarding/rafa-1.mp4", width: nil, height: nil)
      rafa_4_attachments = Attachment.where(file_path: "onboarding/rafa-4.mp4", width: nil, height: nil)
      gleb_1_attachments = Attachment.where(file_path: "onboarding/gleb-1.mp4", width: nil, height: nil)
      gleb_2_attachments = Attachment.where(file_path: "onboarding/gleb-2.mp4", width: nil, height: nil)
      gleb_3_attachments = Attachment.where(file_path: "onboarding/gleb-3.mp4", width: nil, height: nil)
      count = rafa_1_attachments.count + rafa_4_attachments.count + gleb_1_attachments.count + gleb_2_attachments.count + gleb_3_attachments.count

      rafa_1_attachments.update_all(width: 1600, height: 1200) unless dry_run
      rafa_4_attachments.update_all(width: 1600, height: 1200) unless dry_run
      gleb_1_attachments.update_all(width: 1440, height: 1080, preview_file_path: "onboarding/gleb-1.png") unless dry_run
      gleb_2_attachments.update_all(width: 1440, height: 1080, preview_file_path: "onboarding/gleb-2.png") unless dry_run
      gleb_3_attachments.update_all(width: 1440, height: 1080, preview_file_path: "onboarding/gleb-3.png") unless dry_run

      "#{dry_run ? "Would have updated" : "Updated"} #{count} Attachment #{"record".pluralize(count)}"
    end
  end
end
