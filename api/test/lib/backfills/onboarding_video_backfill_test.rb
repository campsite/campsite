# frozen_string_literal: true

require "test_helper"

module Backfills
  class OnboardingVideoBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      test "fixes attributes on onboarding videos" do
        rafa_1 = create(:attachment, :video, file_path: "onboarding/rafa-1.mp4", preview_file_path: "onboarding/rafa-1.png", width: nil, height: nil)
        rafa_4 = create(:attachment, :video, file_path: "onboarding/rafa-4.mp4", preview_file_path: "onboarding/rafa-4.png", width: nil, height: nil)
        gleb_1 = create(:attachment, :video, file_path: "onboarding/gleb-1.mp4", preview_file_path: nil, width: nil, height: nil)
        gleb_2 = create(:attachment, :video, file_path: "onboarding/gleb-2.mp4", preview_file_path: nil, width: nil, height: nil)
        gleb_3 = create(:attachment, :video, file_path: "onboarding/gleb-3.mp4", preview_file_path: nil, width: nil, height: nil)

        OnboardingVideoBackfill.run(dry_run: false)

        assert_equal 1600, rafa_1.reload.width
        assert_equal 1200, rafa_1.height
        assert_equal 1600, rafa_4.reload.width
        assert_equal 1200, rafa_4.height
        assert_equal 1440, gleb_1.reload.width
        assert_equal 1080, gleb_1.height
        assert_equal "onboarding/gleb-1.png", gleb_1.preview_file_path
        assert_equal 1440, gleb_2.reload.width
        assert_equal 1080, gleb_2.height
        assert_equal "onboarding/gleb-2.png", gleb_2.preview_file_path
        assert_equal 1440, gleb_3.reload.width
        assert_equal 1080, gleb_3.height
        assert_equal "onboarding/gleb-3.png", gleb_3.preview_file_path
      end

      test "does not touch non-onboarding videos" do
        original_preview_file_path = "other/video.png"
        other_video = create(:attachment, :video, file_path: "other/video.mp4", preview_file_path: original_preview_file_path, width: nil, height: nil)

        OnboardingVideoBackfill.run(dry_run: false)

        assert_equal original_preview_file_path, other_video.reload.preview_file_path
        assert_nil other_video.width
        assert_nil other_video.height
      end

      test "does nothing on dry run" do
        rafa_1 = create(:attachment, :video, file_path: "onboarding/rafa-1.mp4", preview_file_path: "onboarding/rafa-1.png", width: nil, height: nil)
        rafa_4 = create(:attachment, :video, file_path: "onboarding/rafa-4.mp4", preview_file_path: "onboarding/rafa-4.png", width: nil, height: nil)
        gleb_1 = create(:attachment, :video, file_path: "onboarding/gleb-1.mp4", preview_file_path: nil, width: nil, height: nil)
        gleb_2 = create(:attachment, :video, file_path: "onboarding/gleb-2.mp4", preview_file_path: nil, width: nil, height: nil)
        gleb_3 = create(:attachment, :video, file_path: "onboarding/gleb-3.mp4", preview_file_path: nil, width: nil, height: nil)

        OnboardingVideoBackfill.run

        assert_nil rafa_1.reload.width
        assert_nil rafa_1.height
        assert_nil rafa_4.reload.width
        assert_nil rafa_4.height
        assert_nil gleb_1.reload.width
        assert_nil gleb_1.height
        assert_nil gleb_2.reload.width
        assert_nil gleb_2.height
        assert_nil gleb_3.reload.width
      end
    end
  end
end
