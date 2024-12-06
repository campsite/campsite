# frozen_string_literal: true

require "test_helper"

class MessageJobTest < ActiveJob::TestCase
  context "perform" do
    test "it calls pusher with payload" do
      thread = create(:message_thread, :group)
      message = create(:message, message_thread: thread, sender: thread.owner)
      to_member = thread.organization_memberships.excluding(message.sender).first!

      payload = PusherInvalidateMessageSerializer.preload_and_render(
        {
          message: message,
          message_thread: message.message_thread,
          skip_push: false,
          push_body: message.preview_truncated(thread: message.message_thread, viewer: to_member),
        },
        member: to_member,
        user: to_member.user,
      )

      Pusher.expects(:trigger).with(to_member.user.channel_name, "new-message", payload, {})

      assert_difference -> { message.message_notifications.count }, 1 do
        MessageJob.new.perform(to_member.id, message.id, "new-message")
      end

      message_notification = message.message_notifications.last!
      assert_equal to_member, message_notification.message_thread_membership.organization_membership
      assert_equal [message_notification], to_member.user.unread_message_notifications
      assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [to_member.user.id, message_notification.created_at.iso8601])
    end

    test "it falls back to invalidate event on error" do
      thread = create(:message_thread, :group)
      message = create(:message, message_thread: thread, sender: thread.owner)
      to_member = message.sender

      payload = {
        message_thread_id: message.message_thread.public_id,
        organization_slug: message.message_thread.organization_slug,
      }

      Pusher.expects(:trigger).raises(Pusher::Error.new("Payload Too Large > 10KB"))
      Pusher.expects(:trigger).with(to_member.user.channel_name, "invalidate-thread", payload, {})

      MessageJob.new.perform(to_member.id, message.id, "new-message")
    end

    test "it pushes to other member" do
      sender = create(:organization_membership)
      other_members = create_list(:organization_membership, 3, organization: sender.organization)
      all_members = [sender] + other_members
      thread = create(:message_thread, owner: sender, organization_memberships: all_members)
      message = create(:message, message_thread: thread, sender: sender)

      all_members.each do |member|
        create(:web_push_subscription, user: member.user)
      end

      MessageJob.new.perform(other_members[0].id, message.id, "new-message")

      assert_enqueued_sidekiq_job(DeliverWebPushMessageJob, args: [
        message.id,
        other_members[0].user.web_push_subscriptions.first.id,
        other_members[0].id,
        false,
      ])
    end

    test "it does not push for other events" do
      sender = create(:organization_membership)
      other_members = create_list(:organization_membership, 3, organization: sender.organization)
      all_members = [sender] + other_members
      thread = create(:message_thread, owner: sender, organization_memberships: all_members)
      message = create(:message, message_thread: thread, sender: sender)

      all_members.each do |member|
        create(:web_push_subscription, user: member.user)
      end

      MessageJob.new.perform(other_members[0].id, message.id, "update-message")

      refute_enqueued_sidekiq_job(DeliverWebPushMessageJob, args: [
        message.id,
        other_members[0].user.web_push_subscriptions.first.id,
        other_members[0].id,
        false,
      ])
    end

    test "it does not push to sender" do
      sender = create(:organization_membership)
      other_members = create_list(:organization_membership, 3, organization: sender.organization)
      all_members = [sender] + other_members
      thread = create(:message_thread, owner: sender, organization_memberships: all_members)
      message = create(:message, message_thread: thread, sender: sender)

      all_members.each do |member|
        create(:web_push_subscription, user: member.user)
      end

      MessageJob.new.perform(sender.id, message.id, "new-message")

      refute_enqueued_sidekiq_job(DeliverWebPushMessageJob, args: [
        message.id,
        sender.user.web_push_subscriptions.first.id,
        sender.id,
        false,
      ])
    end

    test "it throws an exception if called with a discarded member ID" do
      to_member = create(:organization_membership, :discarded)
      thread = create(:message_thread, :group, organization_memberships: [to_member])
      message = create(:message, message_thread: thread)

      assert_raises ActiveRecord::RecordNotFound do
        MessageJob.new.perform(to_member.id, message.id, "new-message")
      end
    end

    test "forces notification" do
      sender = create(:organization_membership)
      other_member = create(:organization_membership, organization: sender.organization)
      create(:web_push_subscription, user: other_member.user)
      thread = create(:message_thread, owner: sender, organization_memberships: [sender, other_member])
      message = create(:message, message_thread: thread, sender: sender)

      payload = PusherInvalidateMessageSerializer.preload_and_render(
        {
          message: message,
          message_thread: message.message_thread,
          skip_push: false,
          push_body: message.preview_truncated(thread: message.message_thread, viewer: other_member),
        },
        member: other_member,
        user: other_member.user,
      )
      Pusher.expects(:trigger).with(other_member.user.channel_name, "force-message-notification", payload, {})

      MessageJob.new.perform(other_member.id, message.id, "force-message-notification")

      assert_enqueued_sidekiq_job(DeliverWebPushMessageJob, args: [
        message.id,
        other_member.user.web_push_subscriptions.first.id,
        other_member.id,
        true,
      ])
    end

    context "skips" do
      setup do
        @sender = create(:organization_membership)
        @other_member = create(:organization_membership, organization: @sender.organization)
        @thread = create(:message_thread, owner: @sender, organization_memberships: [@sender, @other_member])
        @message = create(:message, message_thread: @thread, sender: @sender)

        create(:web_push_subscription, user: @other_member.user)
        @thread_membership = MessageThreadMembership.find_by(
          organization_membership: @other_member,
          message_thread: @thread,
        )
      end

      test "it skips push to member with thread notifications off" do
        @thread_membership.notification_level_none!
        perform_test_with_push_expectation(skip_push: true)
      end

      test "it skips push to member with mentions only when message is not mentioning or replying to them" do
        @thread_membership.notification_level_mentions!
        perform_test_with_push_expectation(skip_push: true)
      end

      test "it skips push to member for DM call message" do
        @message.update!(call: create(:call))
        @thread.update!(group: false)

        perform_test_with_push_expectation(skip_push: true)
      end

      test "it does not skip push to member for group call message" do
        @message.update!(call: create(:call))
        @thread.update!(group: true)

        perform_test_with_push_expectation(skip_push: false)
      end

      test "it does not skip push to member with mentions only when message does mention them" do
        @thread_membership.notification_level_mentions!

        mention = MentionsFormatter.format_mention(@other_member)
        @message.content = "Hey #{mention}"
        @message.save!

        perform_test_with_push_expectation(skip_push: false)
      end

      test "it does not skip push to member with mentions only when message is a reply to their message" do
        @thread_membership.notification_level_mentions!

        reply = create(:message, message_thread: @thread, sender: @other_member)
        @message.reply_to = reply
        @message.save!

        perform_test_with_push_expectation(skip_push: false)
      end

      def perform_test_with_push_expectation(skip_push:)
        payload = PusherInvalidateMessageSerializer.preload_and_render(
          {
            message: @message,
            message_thread: @message.message_thread,
            skip_push: skip_push,
            push_body: @message.preview_truncated(thread: @message.message_thread, viewer: @other_member),
          },
          member: @other_member,
          user: @other_member.user,
        )

        Pusher.expects(:trigger).with(@other_member.user.channel_name, "new-message", payload, {})

        MessageJob.new.perform(@other_member.id, @message.id, "new-message")
      end
    end
  end
end
