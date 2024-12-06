# frozen_string_literal: true

require "test_helper"

module Backfills
  class AttachmentVideoDimensionsBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      before do
        mock_movie = mock("movie")
        mock_movie.stubs(:width).returns(42)
        mock_movie.stubs(:height).returns(42)
        FFMPEG::Movie.stubs(:new).returns(mock_movie)
      end

      it "updates video attachments" do
        attachment = create(:attachment, file_type: "video/mp4", width: nil, height: nil)

        AttachmentVideoDimensionsBackfill.run(dry_run: false)

        assert_equal 42, attachment.reload.width
        assert_equal 42, attachment.reload.height
      end

      it "doesn't update video attachments with existing dimensions" do
        attachment = create(:attachment, file_type: "video/mp4", width: 8, height: 8)

        AttachmentVideoDimensionsBackfill.run(dry_run: false)

        assert_equal 8, attachment.reload.width
        assert_equal 8, attachment.reload.height
      end

      it "doesn't update non-video attachments" do
        attachment_1 = create(:attachment, file_type: "image/png", width: nil, height: nil)
        attachment_2 = create(:attachment, file_type: "image/png", width: 8, height: 8)

        AttachmentVideoDimensionsBackfill.run(dry_run: false)

        assert_nil attachment_1.reload.width
        assert_nil attachment_1.reload.height
        assert_equal 8, attachment_2.reload.width
        assert_equal 8, attachment_2.reload.height
      end

      it "skips updates during dry run" do
        attachment = create(:attachment, file_type: "video/mp4", width: nil, height: nil)

        AttachmentVideoDimensionsBackfill.run(dry_run: true)

        assert_nil attachment.reload.width
        assert_nil attachment.reload.height
      end
    end
  end
end
