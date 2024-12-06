# frozen_string_literal: true

require "test_helper"

class FeedTest < ActiveSupport::TestCase
  setup do
    @post = create(:post, created_at: 10.minutes.ago)
    @child = create(:post, parent: @post)
  end

  describe "#id" do
    test "returns the post public id" do
      assert_equal @child.public_id, Feed.new(@child).id
    end
  end

  describe "#root_post" do
    test "returns the nil if is the root node" do
      assert_nil Feed.new(@post).root_post
    end

    test "returns the post root if it is a child node" do
      assert_equal @post, Feed.new(@child).root_post
    end
  end

  describe "latest_post" do
    test "returns the post if is the root node" do
      assert_equal @post, Feed.new(@post).latest_post
    end

    test "returns the post if it is a child node" do
      assert_equal @child, Feed.new(@child).latest_post
    end
  end
end
