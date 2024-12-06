# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notifications
      class DeleteAllControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
        end

        context "#create" do
          test "notified user can archive notifications" do
            create_list(:notification, 3, organization_membership: @member)

            assert_equal 3, @member.inbox_notifications.size

            sign_in(@member.user)

            post organization_notification_delete_all_path(@member.organization.slug)

            assert_response :created
            assert_equal 0, @member.inbox_notifications.size
          end

          test "archive doesnt restore suppressed notification" do
            notifications = create_list(:notification, 3, organization_membership: @member)
            create(:notification, organization_membership: @member, target: notifications.first.target)

            assert_equal 3, @member.inbox_notifications.size

            sign_in(@member.user)

            post organization_notification_delete_all_path(@member.organization.slug)

            assert_response :created
            assert_equal 0, @member.inbox_notifications.size
          end

          test "archives only read notifications" do
            notifications = create_list(:notification, 3, organization_membership: @member)

            assert_equal 3, @member.inbox_notifications.size

            notifications.first.mark_read!
            notifications.second.mark_read!

            sign_in(@member.user)

            post organization_notification_delete_all_path(@member.organization.slug), params: { read_only: true }, as: :json

            assert_response :created
            assert_equal 1, @member.inbox_notifications.size
          end

          test "notified user can archive notifications" do
            events = []
            post1, post2 = create_list(:post, 2, organization: @member.organization, member: @member)
            events << create(:reaction, subject: post1, member: create(:organization_membership, organization: @member.organization)).events
            events << create(:comment, subject: post1, member: create(:organization_membership, organization: @member.organization)).events
            events << create(:comment, subject: post2, member: create(:organization_membership, organization: @member.organization)).events

            events.flatten.each(&:process!)

            assert_equal 3, @member.inbox_notifications.size
            assert_equal 2, @member.inbox_notifications.home_inbox.size
            assert_equal 1, @member.inbox_notifications.activity.size

            sign_in(@member.user)

            post organization_notification_delete_all_path(@member.organization.slug), params: { home_only: true }, as: :json

            assert_response :created
            assert_equal 1, @member.inbox_notifications.size
            assert_equal 0, @member.inbox_notifications.home_inbox.size
            assert_equal 1, @member.inbox_notifications.activity.size
          end
        end
      end
    end
  end
end
