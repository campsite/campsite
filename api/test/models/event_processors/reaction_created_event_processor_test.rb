# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class ReactionCreatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      test "notifies post author" do
        post = create(:post)
        reaction = create(:reaction, subject: post)
        event = reaction.events.created_action.first!

        event.process!

        notifications = reaction.reload.notifications
        assert_equal 1, notifications.count

        notification = notifications.author.first!
        assert_equal post.member, notification.organization_membership
        assert_equal post, notification.target
        assert_nil notification.subtarget
        assert_equal "#{reaction.member.display_name} reacted #{reaction.content} to your post", notification.summary_text
      end

      test "does not notify the post author without permission in private project" do
        project = create(:project, private: true)
        post = create(:post, project: project)
        reaction = create(:reaction, subject: post)
        event = reaction.events.created_action.first!

        event.process!

        notifications = reaction.reload.notifications
        assert_equal 0, notifications.count
      end

      test "notifies comment author" do
        comment = create(:comment)
        reaction = create(:reaction, subject: comment)
        event = reaction.events.created_action.first!

        event.process!

        notifications = reaction.reload.notifications
        assert_equal 1, notifications.count

        notification = notifications.author.first!
        assert_equal comment.member, notification.organization_membership
        assert_equal comment.subject, notification.target
        assert_equal comment, notification.subtarget
        assert_equal "#{reaction.member.display_name} reacted #{reaction.content} to your comment", notification.summary_text
      end

      test "notifies reply author" do
        reply = create(:comment, parent: create(:comment))
        reaction = create(:reaction, subject: reply)
        event = reaction.events.created_action.first!

        event.process!

        notifications = reaction.reload.notifications
        assert_equal 1, notifications.count

        notification = notifications.author.first!
        assert_equal reply.member, notification.organization_membership
        assert_equal reply.subject, notification.target
        assert_equal reply, notification.subtarget
        assert_equal "#{reaction.member.display_name} reacted #{reaction.content} to your reply", notification.summary_text
      end

      test "does not notify the post author if reactor is self" do
        post = create(:post)
        reaction = create(:reaction, subject: post, member: post.member)
        event = reaction.events.created_action.first!

        event.process!

        notifications = reaction.reload.notifications
        assert_equal 0, notifications.count
      end

      test "does not notify the comment author if reactor is self" do
        comment = create(:comment)
        reaction = create(:reaction, subject: comment, member: comment.member)
        event = reaction.events.created_action.first!

        event.process!

        notifications = reaction.reload.notifications
        assert_equal 0, notifications.count
      end

      test "does not notify the reply author if reactor is self" do
        reply = create(:comment, parent: create(:comment))
        reaction = create(:reaction, subject: reply, member: reply.member)
        event = reaction.events.created_action.first!

        event.process!

        notifications = reaction.reload.notifications
        assert_equal 0, notifications.count
      end

      test "does not notify message sender" do
        message = create(:message)
        reaction = create(:reaction, subject: message)
        event = reaction.events.created_action.first!

        assert_no_difference -> { Notification.count } do
          event.process!
        end
      end
    end
  end
end
