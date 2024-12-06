# frozen_string_literal: true

require "test_helper"

class PostTaggingTest < ActiveSupport::TestCase
  describe "validations" do
    test "is invalid for duplicate post tags" do
      existing = create(:post_tagging)
      tagging = build(:post_tagging, tag: existing.tag, post: existing.post)

      assert_not_predicate tagging, :valid?
      assert_equal ["Post has already been tagged with #{existing.tag.name}"], tagging.errors.full_messages
    end

    test "is invalid if maxes out on post tags" do
      Post.stub_const(:POST_TAG_LIMIT, 1) do
        post = create(:post)
        create(:post_tagging, post: post)
        new_tagging = build(:post_tagging, post: post.reload)

        assert_not_predicate new_tagging, :valid?
        assert_equal ["Post can have a max of 1 tags"], new_tagging.errors.full_messages
      end
    end
  end
end
