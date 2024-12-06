# frozen_string_literal: true

require "test_helper"

class User
  class NullUserTest < ActiveSupport::TestCase
    context "#enabled_frontend_features" do
      setup do
        @flag_name = "test_flag"
      end

      test "includes fully enabled feature flags" do
        User.stub_const(:FRONTEND_FEATURES, [@flag_name]) do
          Flipper.enable(@flag_name)
          assert_includes User::NullUser.new.enabled_frontend_features, @flag_name
        end
      end

      test "does not include partially enabled feature flags" do
        User.stub_const(:FRONTEND_FEATURES, [@flag_name]) do
          Flipper.enable(@flag_name, create(:user))
          assert_not_includes User::NullUser.new.enabled_frontend_features, @flag_name
        end
      end

      test "does not include disabled feature flags" do
        User.stub_const(:FRONTEND_FEATURES, [@flag_name]) do
          Flipper.disable(@flag_name)
          assert_not_includes User::NullUser.new.enabled_frontend_features, @flag_name
        end
      end

      test "includes feature flags enabled for the logged_out group" do
        User.stub_const(:FRONTEND_FEATURES, [@flag_name]) do
          Flipper.enable_group(@flag_name, :logged_out)
          assert_includes User::NullUser.new.enabled_frontend_features, @flag_name
        end
      end
    end

    context "#avatar_urls" do
      test "creates fallback avatar URLs from display name" do
        null_user = User::NullUser.new(display_name: "Alice")
        assert_equal "http://campsite-test.imgix.net/static/avatars/A.png?blend-color=6366f1&fit=crop&h=40&w=40", null_user.avatar_urls[:xs]
        assert_equal "http://campsite-test.imgix.net/static/avatars/A.png?blend-color=6366f1&fit=crop&h=128&w=128", null_user.avatar_urls[:xl]
      end

      test "works null users with no display name" do
        null_user = User::NullUser.new
        assert_equal "http://campsite-test.imgix.net/static/avatars/blank.png?blend-color=3b82f6&fit=crop&h=40&w=40", null_user.avatar_urls[:xs]
        assert_equal "http://campsite-test.imgix.net/static/avatars/blank.png?blend-color=3b82f6&fit=crop&h=128&w=128", null_user.avatar_urls[:xl]
      end
    end
  end
end
