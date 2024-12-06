# frozen_string_literal: true

require "test_helper"

class Post
  class PostAuthorTest < ActiveSupport::TestCase
    test "returns a user display name" do
      post = create(:post)
      assert_equal post.member.user.display_name, post.author.display_name
    end

    test "returns an integration name" do
      post = create(:post, :from_integration)
      assert_equal post.integration.display_name, post.author.display_name
    end

    test "returns an oauth application name" do
      post = create(:post, :from_oauth_application)
      assert_equal post.oauth_application.display_name, post.author.display_name
    end
  end
end
