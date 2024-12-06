# frozen_string_literal: true

require "test_helper"

class DestroyPostJobTest < ActiveJob::TestCase
  setup do
    @post = create(:post)
    @other_post = create(:post)
  end

  context "#perform" do
    test "destroys a post" do
      DestroyPostJob.new.perform(@post.id)

      assert_not Post.exists?(@post.id)
      assert Post.exists?(@other_post.id)
    end
  end
end
