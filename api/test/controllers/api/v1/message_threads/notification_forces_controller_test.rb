# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module MessageThreads
      class NotificationForcesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @thread = create(:message_thread, :dm, owner: @member)
          @other_member = @thread.other_members(@member).first
          @other_user = @other_member.user
          @other_user.update!(notifications_paused_at: 1.day.ago, notification_pause_expires_at: 1.day.from_now)
          @message = @thread.send_message!(sender: @member, content: "Hello")
        end

        context "#create" do
          test "forces a notification" do
            Timecop.freeze do
              sign_in @member.user

              assert_query_count 12 do
                post organization_thread_notification_forces_path(@organization.slug, @thread.public_id)
              end

              assert_response :no_content
              assert_in_delta Time.current, @thread.reload.notification_forced_at, 2.seconds
              assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@member.id, @message.id, "force-message-notification"])
            end
          end

          test "does not force a notification if no latest message" do
            @message.destroy!

            sign_in @member.user
            post organization_thread_notification_forces_path(@organization.slug, @thread.public_id)

            assert_response :forbidden
          end

          test "does not force notification if message sent after other user paused notifications" do
            @other_user.update!(notifications_paused_at: @message.created_at + 1.minute)

            sign_in @member.user
            post organization_thread_notification_forces_path(@organization.slug, @thread.public_id)

            assert_response :forbidden
          end

          test "does not force notification if already forced since latest message" do
            @thread.update!(notification_forced_at: @message.created_at + 1.minute)

            sign_in @member.user
            post organization_thread_notification_forces_path(@organization.slug, @thread.public_id)

            assert_response :forbidden
          end

          test "does not force notification if other user notifications aren't paused" do
            @other_user.unpause_notifications!

            sign_in @member.user
            post organization_thread_notification_forces_path(@organization.slug, @thread.public_id)

            assert_response :forbidden
          end

          test "does not force notifications if other user is deactivated" do
            @other_member.update!(discarded_at: Time.current)

            sign_in @member.user
            post organization_thread_notification_forces_path(@organization.slug, @thread.public_id)

            assert_response :forbidden
          end

          test "does not force notification if group thread" do
            @thread.update!(group: true)

            sign_in @member.user
            post organization_thread_notification_forces_path(@organization.slug, @thread.public_id)

            assert_response :forbidden
          end

          test "returns unauthorized for logged-out user" do
            post organization_thread_notification_forces_path(@organization.slug, @thread.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
