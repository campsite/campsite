# frozen_string_literal: true

require "test_helper"

class DeliverWebPushMessageJobTest < ActiveJob::TestCase
  context "perform" do
    test "it calls webpush with payload" do
      thread = create(:message_thread, :dm)
      members = thread.organization_memberships
      message = create(:message, message_thread: thread, sender: members[0])
      subs = members.map do |member|
        create(:web_push_subscription, user: member.user)
      end

      WebPush.expects(:payload_send)
      DeliverWebPushMessageJob.new.perform(message.id, subs[1].id, members[1].id)
    end

    test "it skips webpush when message is read before push" do
      thread = create(:message_thread, :dm)
      members = thread.organization_memberships
      message = create(:message, message_thread: thread, sender: members[0])
      subs = members.map do |member|
        create(:web_push_subscription, user: member.user)
      end

      thread.mark_read(members[1])

      WebPush.expects(:payload_send).never
      DeliverWebPushMessageJob.new.perform(message.id, subs[1].id, members[1].id)
    end

    test "it skips webpush when message is discarded before push" do
      thread = create(:message_thread, :dm)
      members = thread.organization_memberships
      message = create(:message, message_thread: thread, sender: members[0])
      subs = members.map do |member|
        create(:web_push_subscription, user: member.user)
      end

      message.discard

      WebPush.expects(:payload_send).never
      DeliverWebPushMessageJob.new.perform(message.id, subs[1].id, members[1].id)
    end

    test "it skips webpush when user has all thread notifications disabled" do
      thread = create(:message_thread, :dm)
      members = thread.organization_memberships
      message = create(:message, message_thread: thread, sender: members[0])
      subs = members.map do |member|
        create(:web_push_subscription, user: member.user)
      end

      thread_membership = MessageThreadMembership.find_by(
        organization_membership: members[1],
        message_thread: thread,
      )
      thread_membership.notification_level_none!

      WebPush.expects(:payload_send).never
      DeliverWebPushMessageJob.new.perform(message.id, subs[1].id, members[1].id)
    end

    test "it skips webpush when user has mentions only and message doesn't mention or reply to them" do
      thread = create(:message_thread, :dm)
      members = thread.organization_memberships
      message = create(:message, message_thread: thread, sender: members[0])
      subs = members.map do |member|
        create(:web_push_subscription, user: member.user)
      end

      thread_membership = MessageThreadMembership.find_by(
        organization_membership: members[1],
        message_thread: thread,
      )
      thread_membership.notification_level_mentions!

      WebPush.expects(:payload_send).never
      DeliverWebPushMessageJob.new.perform(message.id, subs[1].id, members[1].id)
    end

    test "it skips webpush when user has notifications paused" do
      thread = create(:message_thread, :dm)
      members = thread.organization_memberships
      message = create(:message, message_thread: thread, sender: members[0])
      subs = members.map do |member|
        create(:web_push_subscription, user: member.user)
      end
      members[1].user.update!(notification_pause_expires_at: 1.day.from_now)

      WebPush.expects(:payload_send).never
      DeliverWebPushMessageJob.new.perform(message.id, subs[1].id, members[1].id)
    end

    test "it sends webpush when user has mentions only and message mentions them" do
      thread = create(:message_thread, :dm)
      members = thread.organization_memberships
      message = create(:message, message_thread: thread, sender: members[0])
      subs = members.map do |member|
        create(:web_push_subscription, user: member.user)
      end

      thread_membership = MessageThreadMembership.find_by(
        organization_membership: members[1],
        message_thread: thread,
      )
      thread_membership.notification_level_mentions!

      mention = MentionsFormatter.format_mention(members[1])

      message.content = "Hey #{mention}"
      message.save!

      WebPush.expects(:payload_send)
      DeliverWebPushMessageJob.new.perform(message.id, subs[1].id, members[1].id)
    end

    test "it sends webpush when user has mentions only and message replies to them" do
      thread = create(:message_thread, :dm)
      members = thread.organization_memberships
      message = create(:message, message_thread: thread, sender: members[0])
      subs = members.map do |member|
        create(:web_push_subscription, user: member.user)
      end

      thread_membership = MessageThreadMembership.find_by(
        organization_membership: members[1],
        message_thread: thread,
      )
      thread_membership.notification_level_mentions!

      reply = create(:message, message_thread: thread, sender: members[1])

      message.reply_to = reply
      message.save!

      WebPush.expects(:payload_send)
      DeliverWebPushMessageJob.new.perform(message.id, subs[1].id, members[1].id)
    end

    test "it does not push if subscription is destroyed" do
      thread = create(:message_thread, :dm)
      members = thread.organization_memberships
      message = create(:message, message_thread: thread, sender: members[0])
      subs = members.map do |member|
        create(:web_push_subscription, user: member.user)
      end

      subs[1].destroy!

      WebPush.expects(:payload_send).never
      DeliverWebPushMessageJob.new.perform(message.id, subs[1].id, members[1].id)
    end

    test "it throws an exception if called with a discarded to_member_id" do
      to_member = create(:organization_membership, :discarded)
      sub = create(:web_push_subscription, user: to_member.user)
      thread = create(:message_thread, :group, organization_memberships: [to_member])
      message = create(:message, message_thread: thread)

      assert_raises ActiveRecord::RecordNotFound do
        DeliverWebPushMessageJob.new.perform(message.id, sub.id, to_member.id)
      end
    end
  end
end
