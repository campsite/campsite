# frozen_string_literal: true

require "test_helper"

class ReactionTest < ActiveSupport::TestCase
  context "validations" do
    test "member can't create a new reaction if a kept one already exists for the same subject and content" do
      old_reaction = create(:reaction)

      assert_raises ActiveRecord::RecordInvalid do
        create(:reaction, member: old_reaction.member, subject: old_reaction.subject, content: old_reaction.content)
      end
    end

    test "member can create a new reaction after discarding an existing one" do
      old_reaction = create(:reaction)
      old_reaction.discard

      assert create(:reaction, member: old_reaction.member, subject: old_reaction.subject, content: old_reaction.content)
    end

    test "can't create a reaction with both content and custom content" do
      custom_content = create(:custom_reaction)

      assert_raises ActiveRecord::RecordInvalid do
        create(:reaction, content: "🫠", custom_content: custom_content)
      end
    end

    test "can't create a reaction without content or custom content" do
      assert_raises ActiveRecord::RecordInvalid do
        create(:reaction, content: nil, custom_content: nil)
      end
    end
  end

  test "#instrument_created_event" do
    reaction = create(:reaction)

    assert_equal 1, reaction.events.size
    event = reaction.events.created_action.first!
    assert_equal reaction.member, event.actor
    assert_enqueued_sidekiq_job(ProcessEventJob, args: [event.id])
  end

  test "#instrument_destroyed_event" do
    reaction = create(:reaction)

    reaction.discard

    assert_equal 1, reaction.events.destroyed_action.size
    event = reaction.events.destroyed_action.first!
    assert_equal reaction.member, event.actor
    assert_enqueued_sidekiq_job(ProcessEventJob, args: [event.id])
  end

  context "#notification_summary" do
    before(:each) do
      @notified = create(:organization_membership)
    end

    test "reaction to a post (standard reaction)" do
      post = create(:post, member: @notified, organization: @notified.organization)
      reaction = create(:reaction, subject: post)
      event = create(:event, subject: reaction)
      notification = create(:notification, event: event, organization_membership: @notified, target: post)

      summary = reaction.notification_summary(notification: notification)

      assert_equal "#{reaction.user.display_name} reacted #{reaction.content} to your post", summary.text
      assert_equal "#{reaction.user.display_name} reacted #{reaction.content} to your post <#{post.url}|#{post.title}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: reaction.user.display_name, bold: true } },
        { text: { content: " reacted " } },
        { text: { content: " to " } },
        { text: { content: post.title, bold: true } },
      ],
        summary.blocks
    end

    test "reaction to a post (custom reaction)" do
      post = create(:post, member: @notified, organization: @notified.organization)
      reaction = create(:reaction, :custom_content, subject: post)
      event = create(:event, subject: reaction)
      notification = create(:notification, event: event, organization_membership: @notified, target: post)

      summary = reaction.notification_summary(notification: notification)

      assert_equal "#{reaction.user.display_name} reacted :#{reaction.custom_content.name}: to your post", summary.text
      assert_equal "#{reaction.user.display_name} reacted :#{reaction.custom_content.name}: to your post <#{post.url}|#{post.title}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: reaction.user.display_name, bold: true } },
        { text: { content: " reacted " } },
        { text: { content: " to " } },
        { text: { content: post.title, bold: true } },
      ],
        summary.blocks
    end

    test "reaction to a comment (standard reaction)" do
      post = create(:post, organization: @notified.organization)
      comment = create(:comment, member: @notified, subject: post)
      reaction = create(:reaction, subject: comment)
      event = create(:event, subject: reaction)
      notification = create(:notification, event: event, organization_membership: @notified, target: post)

      summary = reaction.notification_summary(notification: notification)

      assert_equal "#{reaction.user.display_name} reacted #{reaction.content} to your comment", summary.text
      assert_equal "#{reaction.user.display_name} reacted #{reaction.content} to your comment", summary.slack_mrkdwn
      assert_equal [
        { text: { content: reaction.user.display_name, bold: true } },
        { text: { content: " reacted " } },
        { text: { content: " to your comment" } },
      ],
        summary.blocks
    end

    test "reaction to a comment (custom reaction)" do
      post = create(:post, organization: @notified.organization)
      comment = create(:comment, member: @notified, subject: post)
      reaction = create(:reaction, :custom_content, subject: comment)
      event = create(:event, subject: reaction)
      notification = create(:notification, event: event, organization_membership: @notified, target: post)

      summary = reaction.notification_summary(notification: notification)

      assert_equal "#{reaction.user.display_name} reacted :#{reaction.custom_content.name}: to your comment", summary.text
      assert_equal "#{reaction.user.display_name} reacted :#{reaction.custom_content.name}: to your comment", summary.slack_mrkdwn
      assert_equal [
        { text: { content: reaction.user.display_name, bold: true } },
        { text: { content: " reacted " } },
        { text: { content: " to your comment" } },
      ],
        summary.blocks
    end

    test "reaction to a comment reply (standard reaction)" do
      post = create(:post, organization: @notified.organization)
      reply = create(:comment, parent: create(:comment), member: @notified, subject: post)
      reaction = create(:reaction, subject: reply)
      event = create(:event, subject: reaction)
      notification = create(:notification, event: event, organization_membership: @notified, target: post)

      summary = reaction.notification_summary(notification: notification)

      assert_equal "#{reaction.user.display_name} reacted #{reaction.content} to your reply", summary.text
      assert_equal "#{reaction.user.display_name} reacted #{reaction.content} to your reply", summary.slack_mrkdwn
      assert_equal [
        { text: { content: reaction.user.display_name, bold: true } },
        { text: { content: " reacted " } },
        { text: { content: " to your reply" } },
      ],
        summary.blocks
    end

    test "reaction to a comment reply (custom reaction)" do
      post = create(:post, organization: @notified.organization)
      reply = create(:comment, parent: create(:comment), member: @notified, subject: post)
      reaction = create(:reaction, :custom_content, subject: reply)
      event = create(:event, subject: reaction)
      notification = create(:notification, event: event, organization_membership: @notified, target: post)

      summary = reaction.notification_summary(notification: notification)

      assert_equal "#{reaction.user.display_name} reacted :#{reaction.custom_content.name}: to your reply", summary.text
      assert_equal "#{reaction.user.display_name} reacted :#{reaction.custom_content.name}: to your reply", summary.slack_mrkdwn
      assert_equal [
        { text: { content: reaction.user.display_name, bold: true } },
        { text: { content: " reacted " } },
        { text: { content: " to your reply" } },
      ],
        summary.blocks
    end
  end
end
