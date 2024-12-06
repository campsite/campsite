# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notifications
      class MarkAllReadsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
        end

        context "#create" do
          test "notified user can mark notification as read" do
            create_list(:notification, 3, organization_membership: @member)

            assert_equal 3, @member.inbox_notifications.unread.size

            sign_in(@member.user)

            post organization_notification_mark_all_read_path(@member.organization.slug)

            assert_response :created
            assert_equal 0, @member.inbox_notifications.unread.size
          end

          test "notified user can mark notification as read" do
            events = []
            post1, post2 = create_list(:post, 2, organization: @member.organization, member: @member)
            events << create(:reaction, subject: post1, member: create(:organization_membership, organization: @member.organization)).events
            events << create(:comment, subject: post1, member: create(:organization_membership, organization: @member.organization)).events
            events << create(:comment, subject: post2, member: create(:organization_membership, organization: @member.organization)).events

            events.flatten.each(&:process!)

            assert_equal 3, @member.inbox_notifications.unread.size
            assert_equal 2, @member.inbox_notifications.home_inbox.unread.size
            assert_equal 1, @member.inbox_notifications.activity.unread.size

            sign_in(@member.user)

            post organization_notification_mark_all_read_path(@member.organization.slug), params: { home_only: true }, as: :json

            assert_response :created
            assert_equal 1, @member.inbox_notifications.unread.size
            assert_equal 0, @member.inbox_notifications.home_inbox.unread.size
            assert_equal 1, @member.inbox_notifications.activity.unread.size
          end
        end
      end
    end
  end
end
