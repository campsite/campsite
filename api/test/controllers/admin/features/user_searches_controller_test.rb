# frozen_string_literal: true

require "test_helper"

module Admin
  module Features
    class UserSearchesControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#show" do
        it "returns users with matching emails" do
          create(:user, email: "ryan@campsite.com")
          create(:user, email: "jesper@campsite.com")

          sign_in(@staff)
          get feature_user_search_path(
            "my_cool_feature",
            params: { q: "ryan" },
            xhr: true,
          )

          assert_response :ok
          assert_includes response.body, "ryan@campsite.com"
          assert_not_includes response.body, "jesper@campsite.com"
        end

        it "does not include users with the feature already enabled" do
          user = create(:user, email: "derek@campsite.com")
          feature_name = "my_cool_feature"
          Flipper.enable(feature_name, user)

          sign_in(@staff)
          get feature_user_search_path(
            feature_name,
            params: { q: user.email },
            xhr: true,
          )

          assert_response :ok
          assert_not_includes response.body, user.email
        end

        it "includes users who have the flag enabled for a group they're a member of but not individually" do
          user = create(:user, email: "brian@campsite.com")
          feature_name = "my_cool_feature"
          Flipper.enable_group(feature_name, :staff)

          sign_in(@staff)
          get feature_user_search_path(
            feature_name,
            params: { q: user.email },
            xhr: true,
          )

          assert_response :ok
          assert_includes response.body, user.email
        end
      end
    end
  end
end
