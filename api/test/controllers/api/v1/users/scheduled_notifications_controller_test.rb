# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class ScheduledNotificationsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
        end

        context "#index" do
          setup do
            @notification = @user.scheduled_notifications.first
          end

          test "returns a list the current user's scheduled_notifications" do
            sign_in @user
            get current_user_scheduled_notifications_path

            assert_response :ok
            assert_response_gen_schema

            assert_equal @notification.public_id, json_response[0]["id"]
            assert_equal @notification.name, json_response[0]["name"]
            assert_equal @notification.formatted_delivery_time, json_response[0]["delivery_time"]
            assert_equal @notification.delivery_day, json_response[0]["delivery_day"]
            assert_equal @notification.time_zone, json_response[0]["time_zone"]
          end

          test "return 401 for an unauthenticated user" do
            get current_user_scheduled_notifications_path
            assert_response :unauthorized
          end
        end

        context "#create" do
          test "creates a scheduled notification" do
            sign_in @user

            assert_difference -> { @user.scheduled_notifications.count }, 1 do
              post current_user_scheduled_notifications_path,
                params: { name: "weekly_digest", delivery_time: "5:00 am", delivery_day: "monday", time_zone: "UTC" }

              assert_response :created
              assert_response_gen_schema
            end
          end

          test "returns an error for invalid params" do
            sign_in @user

            post current_user_scheduled_notifications_path
            assert_response :unprocessable_entity
            assert_match(/can't be blank/, json_response["message"])
          end

          test "return 403 for an unconfirmed user" do
            @user.update!(confirmed_at: nil)

            sign_in @user

            post current_user_scheduled_notifications_path
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post current_user_scheduled_notifications_path
            assert_response :unauthorized
          end
        end

        context "#update" do
          before do
            @notification = create(:scheduled_notification, name: :weekly_digest, schedulable: @user)
          end

          test "updates a scheduled notification" do
            sign_in @user

            put current_user_scheduled_notification_path(@notification.public_id),
              params: { delivery_time: "9:00 am", delivery_day: "tuesday", time_zone: "America/Chicago" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal json_response["delivery_time"], "9:00 am"
            assert_equal json_response["delivery_day"], "tuesday"
            assert_equal json_response["time_zone"], "America/Chicago"
          end

          test "returns an error for invalid time zone" do
            sign_in @user

            put current_user_scheduled_notification_path(@notification.public_id),
              params: { delivery_time: "9:00 am", delivery_day: "tuesday", time_zone: "Invalid" }
            assert_response :unprocessable_entity
            assert_match(/Time zone does not exist/, json_response["message"])
          end

          test "returns an error for invalid delivery time" do
            sign_in @user

            put current_user_scheduled_notification_path(@notification.public_id),
              params: { delivery_time: "44:0m", delivery_day: "tuesday", time_zone: "America/Chicago" }

            assert_response :unprocessable_entity
            assert_match(/Delivery time can't be blank/, json_response["message"])
          end

          test "return 403 for an unconfirmed user" do
            @user.update!(confirmed_at: nil)

            sign_in @user

            put current_user_scheduled_notification_path(@notification.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            put current_user_scheduled_notification_path(@notification.public_id)
            assert_response :unauthorized
          end
        end

        context "#destroy" do
          setup do
            @notification = create(:scheduled_notification, schedulable: @user)
          end

          test "returns ok" do
            sign_in @user
            delete current_user_scheduled_notification_path(@notification.public_id)

            assert_response :no_content
            assert_nil ScheduledNotification.find_by(id: @notification.id)
          end

          test "return 401 for an unauthenticated user" do
            delete current_user_scheduled_notification_path(@notification.public_id)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
