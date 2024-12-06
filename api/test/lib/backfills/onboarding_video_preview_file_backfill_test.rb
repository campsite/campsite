# frozen_string_literal: true

require "test_helper"

module Backfills
  class OnboardingVideoPreviewFileBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      test "sets preview_file_path on onboarding videos" do
        onboarding_video_1 = create(:attachment, :video, file_path: "onboarding/rafa-1.mp4", preview_file_path: nil)
        onboarding_video_2 = create(:attachment, :video, file_path: "onboarding/rafa-4.mp4", preview_file_path: nil)

        OnboardingVideoPreviewFileBackfill.run(dry_run: false)

        assert_equal "onboarding/rafa-1.png", onboarding_video_1.reload.preview_file_path
        assert_equal "onboarding/rafa-4.png", onboarding_video_2.reload.preview_file_path
      end

      test "does not touch preview_file_path on non-onboarding videos" do
        original_preview_file_path = "other/video.png"
        other_video = create(:attachment, :video, file_path: "other/video.mp4", preview_file_path: original_preview_file_path)

        OnboardingVideoPreviewFileBackfill.run(dry_run: false)

        assert_equal original_preview_file_path, other_video.reload.preview_file_path
      end

      test "does nothing on dry run" do
        onboarding_video_1 = create(:attachment, :video, file_path: "onboarding/rafa-1.mp4", preview_file_path: nil)
        onboarding_video_2 = create(:attachment, :video, file_path: "onboarding/rafa-4.mp4", preview_file_path: nil)

        OnboardingVideoPreviewFileBackfill.run

        assert_nil onboarding_video_1.reload.preview_file_path
        assert_nil onboarding_video_2.reload.preview_file_path
      end
    end
  end
end
