# frozen_string_literal: true

require "test_helper"

module Admin
  module Features
    class UsersControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#create" do
        test "it enables a flag for a user" do
          user = create(:user)
          feature_name = "my_cool_feature"
          assert_not Flipper.enabled?(feature_name, user)

          sign_in(@staff)
          post feature_users_path(feature_name, params: { email: user.email })

          assert_response :redirect
          assert_equal "Enabled #{feature_name} for #{user.email}", flash[:notice]
          assert Flipper.enabled?(feature_name, user)

          audit_log = FlipperAuditLog.last!
          assert_equal user.name, audit_log.target_display_name
        end

        test "it returns an error when user not found" do
          sign_in(@staff)
          post feature_users_path("my_cool_feature", params: { email: "noone@nobody.net" })

          assert_response :redirect
          assert_equal "No user found with that email", flash[:alert]
        end
      end

      context "#destroy" do
        test "it disables a flag for a user" do
          user = create(:user)
          feature_name = "my_cool_feature"
          Flipper.enable(feature_name, user)

          sign_in(@staff)
          delete feature_user_path(feature_name, user)

          assert_response :redirect
          assert_equal "Disabled #{feature_name} for #{user.email}", flash[:notice]
          assert_not Flipper.enabled?(feature_name, user)
        end

        test "it returns an error when user not found" do
          feature_name = "my_cool_feature"

          sign_in(@staff)
          delete feature_user_path(feature_name, "foobar")

          assert_response :redirect
          assert_equal "User not found", flash[:alert]
        end
      end
    end
  end
end
