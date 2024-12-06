# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class NotificationSchedulesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
        end

        context "#show" do
          test "user can view their notification schedule" do
            schedule = create(:notification_schedule, user: @user)

            sign_in @user
            get users_notification_schedule_path

            assert_response :ok
            assert_response_gen_schema
            assert_equal "custom", json_response["type"]
            assert_equal schedule.days, json_response.dig("custom", "days")
            assert_equal schedule.start_time_formatted, json_response.dig("custom", "start_time")
            assert_equal schedule.end_time_formatted, json_response.dig("custom", "end_time")
          end

          test "user can view their lack of notification schedule" do
            sign_in @user
            get users_notification_schedule_path

            assert_response :ok
            assert_response_gen_schema
            assert_equal "none", json_response["type"]
          end

          test "return 401 for an unauthenticated user" do
            get users_notification_schedule_path

            assert_response :unauthorized
          end
        end

        context "#update" do
          test "user can update notification schedule" do
            Timecop.freeze(Time.zone.parse("2024-09-26T17:00Z")) do
              sign_in @user

              assert_query_count 12 do
                put users_notification_schedule_path, params: {
                  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  start_time: "09:00",
                  end_time: "17:00",
                }
              end

              assert_response :ok
              assert_response_gen_schema
              assert_equal ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], json_response["days"]
              assert_equal "09:00", json_response["start_time"]
              assert_equal "17:00", json_response["end_time"]
            end
          end

          test "updates existing schedule" do
            Timecop.freeze(Time.zone.parse("2024-09-26T17:00Z")) do
              schedule = create(:notification_schedule, user: @user, last_applied_at: 1.day.ago)

              sign_in @user

              assert_query_count 11 do
                put users_notification_schedule_path, params: {
                  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  start_time: "09:00",
                  end_time: "17:00",
                }
              end

              assert_response :ok
              assert_response_gen_schema
              assert_equal ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], schedule.reload.days
              assert_equal "09:00", schedule.start_time_formatted
              assert_equal "17:00", schedule.end_time_formatted
            end
          end

          test "returns 422 for no days" do
            sign_in @user
            put users_notification_schedule_path, params: {
              days: [],
              start_time: "09:00",
              end_time: "17:00",
            }

            assert_response :unprocessable_entity
          end

          test "returns 422 for bogus time" do
            sign_in @user
            put users_notification_schedule_path, params: {
              days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              start_time: "foobar",
              end_time: "17:00",
            }

            assert_response :unprocessable_entity
          end

          test "returns 422 for start time after end time" do
            sign_in @user
            put users_notification_schedule_path, params: {
              days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              start_time: "17:30",
              end_time: "17:00",
            }

            assert_response :unprocessable_entity
          end

          test "return 401 for an unauthenticated user" do
            put users_notification_schedule_path, params: {
              days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              start_time: "09:00",
              end_time: "17:00",
            }

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          test "destroys the notification schedule" do
            create(:notification_schedule, user: @user)

            sign_in @user
            delete users_notification_schedule_path

            assert_response :no_content
            assert_nil @user.reload.notification_schedule
          end

          test "no-op if user has no notification schedule" do
            sign_in @user
            delete users_notification_schedule_path

            assert_response :no_content
            assert_nil @user.reload.notification_schedule
          end

          test "return 401 for an unauthenticated user" do
            delete users_notification_schedule_path

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
