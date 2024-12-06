# frozen_string_literal: true

require "test_helper"

class AttachmentDimensionsJobTest < ActiveJob::TestCase
  context "#perform" do
    setup do
      @width = 300
      @height = 200
    end

    test "updates image attachments" do
      FastImage.stubs(:size).returns([@width, @height])
      attachment = create(:attachment, width: nil, height: nil)

      AttachmentDimensionsJob.new.perform(attachment.id)

      assert_equal @width, attachment.reload.width
      assert_equal @height, attachment.height
    end

    test "updates video attachments" do
      duration = 100
      mock = mock("movie")
      mock.stubs(:width).returns(@width)
      mock.stubs(:height).returns(@height)
      mock.stubs(:duration).returns(duration)
      FFMPEG::Movie.stubs(:new).returns(mock)
      attachment = create(:attachment, :video, width: nil, height: nil)

      AttachmentDimensionsJob.new.perform(attachment.id)

      assert_equal @width, attachment.reload.width
      assert_equal @height, attachment.height
      assert_equal duration, attachment.duration
    end
  end
end
