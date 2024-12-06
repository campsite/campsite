# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class ArchivedNotificationsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      context "#index" do
        before do
          @user_member = create(:organization_membership)
          @organization = @user_member.organization
          @user = @user_member.user
        end

        test "returns latest discarded notification for a target for the current user" do
          post = create(:post, :resolved, organization: @organization, member: @user_member)

          newer_comment = create(:comment, subject: post, body_html: "<p>Hello, world!</p>")
          newer_comment.events.first!.process!

          Timecop.travel(5.minutes.ago) do
            older_comment = create(:comment, subject: post)
            older_comment.events.first!.process!
          end

          Notification.update_all(archived_at: Time.current)

          sign_in @user

          assert_query_count 18 do
            get organization_membership_archived_notifications_path(@organization)
          end

          assert_response :ok
          assert_response_gen_schema

          assert_equal 1, json_response["data"].length
          result_notification = json_response["data"].first
          assert_equal newer_comment.notifications.first!.public_id, result_notification["id"]
          assert_equal "Harry Potter commented on #{post.title}", result_notification["summary"]
          assert_equal "Hello, world!", result_notification["body_preview"]
          assert_equal @organization.slug, result_notification["organization_slug"]
          assert_equal post.public_id, result_notification.dig("target", "id")
          assert_equal true, result_notification.dig("target", "resolved")
          assert_equal post.project.name, result_notification.dig("target", "project", "name")
          assert_equal newer_comment.public_id, result_notification.dig("subject", "id")
        end

        test "ordered by most recently archived" do
          recently_archived_notification = create(:notification, created_at: 10.minutes.ago, archived_at: 10.minutes.ago, organization_membership: @user_member)
          less_recently_archived_notification = create(:notification, created_at: 5.minutes.ago, archived_at: 15.minutes.ago, organization_membership: @user_member)

          sign_in @user
          get organization_membership_archived_notifications_path(@organization)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response["data"].length
          assert_equal recently_archived_notification.public_id, json_response["data"].first["id"]
          assert_equal less_recently_archived_notification.public_id, json_response["data"].second["id"]
        end

        test "returns unauthorized for logged-out user" do
          get organization_membership_archived_notifications_path(@organization)
          assert_response :unauthorized
        end
      end
    end
  end
end
