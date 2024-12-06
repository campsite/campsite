# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class NotificationPausesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
        end

        context "#create" do
          test "user can pause notifications" do
            Timecop.freeze do
              sign_in @user
              post users_notification_pause_path, params: { expires_at: 1.hour.from_now.iso8601 }

              assert_response :no_content
              assert_in_delta 1.hour.from_now, @user.reload.notification_pause_expires_at, 2.seconds
              assert_enqueued_sidekiq_jobs(2, only: BroadcastUserStaleJob)
            end
          end

          test "returns 422 for bogus time" do
            sign_in @user
            post users_notification_pause_path, params: { expires_at: "foobar" }

            assert_response :unprocessable_entity
          end

          test "return 401 for an unauthenticated user" do
            post users_notification_pause_path, params: { expires_at: 1.hour.from_now.iso8601 }

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          setup do
            @user.update!(notification_pause_expires_at: 1.hour.from_now)
          end

          test "user can unpause notifications" do
            sign_in @user
            delete users_notification_pause_path

            assert_response :no_content
            assert_nil @user.reload.notification_pause_expires_at
            assert_enqueued_sidekiq_jobs(1, only: BroadcastUserStaleJob)
          end

          test "return 401 for an unauthenticated user" do
            delete users_notification_pause_path

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
