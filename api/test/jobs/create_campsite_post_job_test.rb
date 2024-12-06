# frozen_string_literal: true

require "test_helper"

class CreateCampsitePostJobTest < ActiveJob::TestCase
  context "perform" do
    test "creates a campsite post" do
      CampsiteClient.any_instance.expects(:create_post).with(title: nil, content_markdown: "content", project_id: "foo")
      CreateCampsitePostJob.new.perform(nil, "content", "foo")
    end
  end
end
