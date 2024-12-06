# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class TimezonesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
        end

        context "#create" do
          test "updates the user's timezone" do
            sign_in @user
            post users_timezone_path, params: { timezone: "America/Chicago" }

            assert_response :ok

            assert_equal @user.reload.preferred_timezone, "America/Chicago"
          end

          test "errors with invalid timezone" do
            sign_in @user
            post users_timezone_path, params: { timezone: "Invalid/Timezone" }

            assert_response :unprocessable_entity

            assert_nil @user.reload.preferred_timezone
          end
        end
      end
    end
  end
end
