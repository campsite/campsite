# frozen_string_literal: true

require "test_helper"

class CreateCampsiteCommentJobTest < ActiveJob::TestCase
  context "perform" do
    test "creates a campsite comment" do
      CampsiteClient.any_instance.expects(:create_comment).with(post_id: "xbsbn74r4u9d", content_markdown: "content", parent_id: nil)
      CreateCampsiteCommentJob.new.perform("xbsbn74r4u9d", "content")
    end
  end
end
