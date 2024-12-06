# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class ProductLogsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:user)
      end

      context "#create" do
        test "it queues multiple events" do
          events = [
            { user_id: @user.public_id, name: "test", data: { foo: "bar" } },
            { user_id: @user.public_id, name: "test_test", data: { foo: "baz" } },
            { user_id: @user.public_id, name: "testing", data: { foo: "cat" } },
          ]

          sign_in @user

          post product_logs_path, params: { events: events }, as: :json, headers: { "HTTP_USER_AGENT" => desktop_user_agent }

          assert_response :created
          assert_response_gen_schema

          assert_enqueued_sidekiq_job(
            ProductLogsJob,
            args: [
              events.as_json,
              desktop_user_agent,
              "{}",
            ],
            count: 1,
          )
        end

        test "it records when event comes from PWA" do
          events = [
            { user_id: @user.public_id, name: "test", data: { foo: "bar" } },
          ]

          sign_in @user

          post product_logs_path, params: { events: events }, as: :json, headers: { "X-Campsite-PWA" => "true" }

          assert_response :created
          assert_response_gen_schema

          assert_enqueued_sidekiq_job(
            ProductLogsJob,
            args: [
              events.as_json,
              nil,
              { "x-campsite-pwa" => "true" }.to_json,
            ],
            count: 1,
          )
        end

        test "it queues events in slices if there are many" do
          events = [
            { user_id: @user.public_id, name: "test", data: { foo: "bar" } },
            { user_id: @user.public_id, name: "test_test", data: { foo: "baz" } },
            { user_id: @user.public_id, name: "testing", data: { foo: "cat" } },
          ] * 10

          sign_in @user

          post product_logs_path(params: { events: events }, as: :json)

          assert_response :created
          assert_response_gen_schema

          assert_enqueued_sidekiq_jobs(3, only: ProductLogsJob)
        end
      end
    end
  end
end
