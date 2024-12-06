# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notifications
      class ReadsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @notified_member = create(:organization_membership)
          @notification = create(:notification, organization_membership: @notified_member)
        end

        context "#create" do
          test "notified user can mark notification as read" do
            sign_in(@notified_member.user)

            post organization_notification_read_path(@notified_member.organization, @notification.public_id)

            assert_response :created
            assert_predicate @notification.reload, :read?
          end

          test "marking one notification as read marks older notifications for the same user and target as read" do
            other_notification = create(:notification, organization_membership: @notified_member, target: @notification.target)

            sign_in(@notified_member.user)

            post organization_notification_read_path(@notified_member.organization, @notification.public_id)

            assert_response :created
            assert_predicate @notification.reload, :read?
            assert_predicate other_notification.reload, :read?
          end

          test "random user cannot mark notified user's notification as read" do
            sign_in(create(:user))

            post organization_notification_read_path(@notified_member.organization, @notification.public_id)

            assert_response :forbidden
            assert_not_predicate @notification.reload, :read?
          end
        end

        context "#destroy" do
          test "notified user can mark notification as unread" do
            @notification.mark_read!
            sign_in(@notified_member.user)

            delete organization_notification_read_path(@notified_member.organization, @notification.public_id)

            assert_response :ok
            assert_not_predicate @notification.reload, :read?
          end

          test "random user cannot mark notified uesr's notification as unread" do
            @notification.mark_read!
            sign_in(create(:user))

            delete organization_notification_read_path(@notified_member.organization, @notification.public_id)

            assert_response :forbidden
            assert_predicate @notification.reload, :read?
          end
        end
      end
    end
  end
end
