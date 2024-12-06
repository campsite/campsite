# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class WebPushSubscriptionsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:user)
      end

      context "#create" do
        test "it creates a subscription" do
          sign_in @user

          assert_difference -> { WebPushSubscription.count } do
            post web_push_subscriptions_path,
              params: {
                old_endpoint: nil,
                new_endpoint: "https://example.com",
                p256dh: "p256dh",
                auth: "auth",
              },
              as: :json
          end

          assert_response :no_content

          sub = WebPushSubscription.last
          assert_equal "https://example.com", sub.endpoint
          assert_equal "p256dh", sub.p256dh
          assert_equal "auth", sub.auth
          assert_equal @user, sub.user
          assert_equal @user.web_push_subscriptions, [sub]
        end

        test "it updates a subscription" do
          sign_in @user

          create(:web_push_subscription, user: @user, endpoint: "https://example.com")

          assert_difference -> { WebPushSubscription.count }, 0 do
            post web_push_subscriptions_path,
              params: {
                old_endpoint: "https://example.com",
                new_endpoint: "https://foo.bar",
                p256dh: "12345",
                auth: "abcde",
              },
              as: :json
          end

          assert_response :no_content

          sub = WebPushSubscription.last
          assert_equal "https://foo.bar", sub.endpoint
          assert_equal "12345", sub.p256dh
          assert_equal "abcde", sub.auth
        end
      end
    end
  end
end
