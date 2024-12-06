# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class PreferencessControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:user)
      end

      context "#update" do
        test "sets email notification to enabled" do
          sign_in @user
          put users_preference_path, params: { preference: "email_notifications", value: "enabled" }

          assert_response :ok
          assert_response_gen_schema
          assert_equal "enabled", json_response["preference"]
          assert_equal "enabled", @user.find_or_initialize_preference(:email_notifications).value
        end

        test "sets email notification to disabled" do
          sign_in @user
          put users_preference_path, params: { preference: "email_notifications", value: "disabled" }

          assert_response :ok
          assert_response_gen_schema
          assert_equal "disabled", json_response["preference"]
          assert_equal "disabled", @user.find_or_initialize_preference(:email_notifications).value
        end

        test "gracefully handles bad value" do
          sign_in @user
          put users_preference_path, params: { preference: "email_notifications", value: "foobar" }

          assert_response :unprocessable_entity
          assert_nil @user.find_or_initialize_preference(:theme).value
          assert_equal "Value foobar is not a valid preference for email_notifications", json_response["message"]
        end

        test "gracefully handles bad key" do
          sign_in @user
          put users_preference_path, params: { preference: "foo", value: "bar" }

          assert_response :unprocessable_entity
          assert_nil @user.find_or_initialize_preference(:theme).value
          assert_equal "Key foo is not a valid user preference and Value bar is not a valid preference for foo", json_response["message"]
        end

        test "gracefully handles no authorized user" do
          put users_preference_path, params: { preference: "email_notifications", value: "enabled" }

          assert_response :unauthorized
          assert_equal "Sign in or sign up before continuing", json_response["message"]
          assert_nil @user.find_or_initialize_preference(:email_notifications).value
        end
      end
    end
  end
end
