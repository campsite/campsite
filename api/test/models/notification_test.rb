# frozen_string_literal: true

require "test_helper"

class NotificationTest < ActiveSupport::TestCase
  context "#summary" do
    test "includes the third-party author's name" do
      post = create(:post)
      notification = build(:notification, target: post, organization_membership: post.member)

      assert_equal "Harry Potter mentioned you in a comment", notification.summary.text
    end
  end

  context "#body_preview" do
    test "splits list items into separate lines" do
      post = create(:post, description_html: "<ul><li>Item 1</li><li>Item 2</li></ul>")
      notification = build(:notification, event: build(:event, subject: post))

      assert_equal "• Item 1...", notification.body_preview
    end

    test "includes resolved comment preview in reply_to_body_preview" do
      comment = create(:comment)
      notification = build(:notification, event: build(:event, subject: comment), reason: "comment_resolved")

      assert_nil notification.body_preview
      assert_equal comment.plain_body_text, notification.reply_to_body_preview
    end

    test "includes resolved post preview" do
      post = create(:post)
      post.resolve!(
        actor: create(:organization_membership, organization: post.organization),
        html: "<p>foo bar</p>",
        comment_id: nil,
      )
      notification = build(:notification, event: build(:event, subject: post), reason: "post_resolved", organization: post.organization)

      assert_equal "foo bar", notification.body_preview
    end
  end

  context "#body_preview_prefix" do
    test "nil for follow-up notifications" do
      notification = build(:notification, reason: "follow_up")

      assert_nil notification.body_preview_prefix
    end

    test "nil for project subscription notifications" do
      notification = build(:notification, reason: "project_subscription")

      assert_nil notification.body_preview_prefix
      assert_equal "#{notification.actor.display_name} posted", notification.body_preview_prefix_fallback
    end

    test "nil for post resolved notifications" do
      notification = build(:notification, reason: "post_resolved")

      assert_nil notification.body_preview_prefix
      assert_equal "#{notification.actor.display_name} resolved post", notification.body_preview_prefix_fallback
    end

    test "nil for post resolved from comment notifications" do
      notification = build(:notification, reason: "post_resolved_from_comment")

      assert_nil notification.body_preview_prefix
      assert_equal "#{notification.actor.display_name} resolved post from comment", notification.body_preview_prefix_fallback
    end

    test "mention notifications include the author's name" do
      notification = build(:notification, reason: "mention")

      assert_equal "#{notification.actor.display_name} mentioned you", notification.body_preview_prefix
      assert_nil notification.body_preview_prefix_fallback
    end

    test "comment notifications include the author's name" do
      comment = build(:comment)
      notification = build(:notification, reason: "author", event: build(:event, subject: comment))

      assert_equal "#{comment.author.display_name} commented", notification.body_preview_prefix
      assert_nil notification.body_preview_prefix_fallback
    end

    test "reply notifications include the author's name" do
      reply = build(:comment, parent: build(:comment))
      notification = build(:notification, reason: "author", event: build(:event, subject: reply))

      assert_equal "#{reply.author.display_name} replied", notification.body_preview_prefix
      assert_nil notification.body_preview_prefix_fallback
    end

    test "call processing complete notifications" do
      notification = build(:notification, reason: "processing_complete", event: build(:event, subject: create(:call)))

      assert_equal "Summary ready", notification.body_preview_prefix
      assert_nil notification.body_preview_prefix_fallback
    end

    test "uses actor's name for other notifications" do
      notification = build(:notification, reason: "author", event: build(:event, subject: create(:post)))

      assert_equal notification.actor.display_name, notification.body_preview_prefix
      assert_nil notification.body_preview_prefix_fallback
    end
  end

  context "#inbox_key" do
    test "same for two Notification records with the same target and target scope" do
      post = create(:post)
      notification_a = build(:notification, target: post, target_scope: "feedback_request")
      notification_b = build(:notification, target: post, target_scope: "feedback_request")

      assert_equal notification_a.inbox_key, notification_b.inbox_key
    end

    test "different for two Notification records with different targets" do
      post_a = create(:post)
      post_b = create(:post)
      notification_a = build(:notification, target: post_a, target_scope: "feedback_request")
      notification_b = build(:notification, target: post_b, target_scope: "feedback_request")

      assert_not_equal notification_a.inbox_key, notification_b.inbox_key
    end

    test "different for two Notification records with different target scopes" do
      post = create(:post)
      notification_a = build(:notification, target: post, target_scope: "feedback_request")
      notification_b = build(:notification, target: post, target_scope: nil)

      assert_not_equal notification_a.inbox_key, notification_b.inbox_key
    end
  end

  context "#inbox?" do
    test "true for a post target notification" do
      notification = build(:notification, target: build(:post))

      assert_equal true, notification.inbox?
    end

    test "true for a note target notification" do
      notification = build(:notification, target: build(:note))

      assert_equal true, notification.inbox?
    end

    test "true for a call target notification" do
      notification = build(:notification, target: build(:call))

      assert_equal true, notification.inbox?
    end

    test "false for a project target notification" do
      notification = build(:notification, target: build(:project))

      assert_equal false, notification.inbox?
    end

    test "false for a comment_resolved notification" do
      notification = build(:notification, target: build(:post), reason: "comment_resolved")

      assert_equal false, notification.inbox?
    end

    test "false for a reaction notification" do
      notification = build(:notification, target: build(:post), target_scope: "reaction")

      assert_equal false, notification.inbox?
    end
  end

  context "slack messages" do
    before(:each) do
      @member = create(:organization_membership)
      @member_slack_user_id = "U12345678"
      slack_integration = create(:integration, :slack, owner: @member.organization)
      integration_member = slack_integration.integration_organization_memberships.create!(organization_membership: @member)
      @slack_user_data = integration_member.data.create!(name: IntegrationOrganizationMembershipData::INTEGRATION_USER_ID, value: @member_slack_user_id)
    end

    context "#deliver_slack_message!" do
      it "delivers a Slack message for a post" do
        post = create(:post, organization: @member.organization, description_html: "<p>My post</p>")
        event = post.events.created_action.first!
        notification = create(:notification, :mention, organization_membership: @member, event: event, target: post)

        StyledText.any_instance.expects(:html_to_slack_blocks).returns([{ type: "mrkdwn", text: "My post" }])

        slack_message_ts = "1234567890.123456"
        Slack::Web::Client.any_instance.expects(:chat_postMessage).with({
          text: "#{event.actor.display_name} mentioned you in #{post.title}",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "#{event.actor.display_name} <#{notification.subject.url}|mentioned you in #{post.title}>",
              },
            },
          ],
          attachments: [
            {
              blocks: [
                {
                  type: "mrkdwn",
                  text: "My post",
                },
                {
                  type: "context",
                  elements: [
                    {
                      type: "mrkdwn",
                      text: "Posted in <#{post.project.url}|#{post.project.name}>",
                    },
                  ],
                },
              ],
              color: Campsite::BRAND_ORANGE_HEX_CODE,
            },
          ],
          channel: @member_slack_user_id,
          unfurl_links: false,
          unfurl_media: false,
        }).returns({ "ts" => slack_message_ts })

        notification.deliver_slack_message!

        notification.reload
        assert_equal slack_message_ts, notification.slack_message_ts
      end

      it "delivers a Slack message for a comment" do
        post = create(:post, organization: @member.organization)
        comment = create(:comment, subject: post, body_html: "<p>My comment</p>")
        event = comment.events.created_action.first!
        notification = create(:notification, :mention, organization_membership: @member, event: event, target: comment.subject)

        StyledText.any_instance.expects(:html_to_slack_blocks).returns([{ type: "mrkdwn", text: "My comment" }])

        slack_message_ts = "1234567890.123456"
        Slack::Web::Client.any_instance.expects(:chat_postMessage).with({
          text: "#{event.actor.display_name} mentioned you in a comment",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "#{event.actor.display_name} <#{notification.subject.url}|mentioned you in a comment>",
              },
            },
          ],
          attachments: [
            {
              blocks: [
                {
                  type: "mrkdwn",
                  text: "My comment",
                },
              ],
              color: Campsite::BRAND_ORANGE_HEX_CODE,
            },
          ],
          channel: @member_slack_user_id,
          unfurl_links: false,
          unfurl_media: false,
        }).returns({ "ts" => slack_message_ts })

        notification.deliver_slack_message!

        notification.reload
        assert_equal slack_message_ts, notification.slack_message_ts
      end

      it "delivers a Slack message for a feedback request" do
        post = create(:post, organization: @member.organization, description_html: "<p>My post</p>")
        feedback_request = create(:post_feedback_request, post: post)
        event = feedback_request.events.created_action.first!
        notification = create(:notification, organization_membership: @member, event: event, target: post)

        StyledText.any_instance.expects(:html_to_slack_blocks).returns([{ type: "mrkdwn", text: "My post" }])

        slack_message_ts = "1234567890.123456"
        Slack::Web::Client.any_instance.expects(:chat_postMessage).with({
          text: "#{event.actor.display_name} requested your feedback",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "#{event.actor.display_name} requested your feedback",
              },
            },
          ],
          attachments: [
            {
              blocks: [
                {
                  type: "mrkdwn",
                  text: "My post",
                },
                {
                  type: "context",
                  elements: [
                    {
                      type: "mrkdwn",
                      text: "Posted in <#{post.project.url}|#{post.project.name}>",
                    },
                  ],
                },
              ],
              color: Campsite::BRAND_ORANGE_HEX_CODE,
            },
          ],
          channel: @member_slack_user_id,
          unfurl_links: false,
          unfurl_media: false,
        }).returns({ "ts" => slack_message_ts })

        notification.deliver_slack_message!

        notification.reload
        assert_equal slack_message_ts, notification.slack_message_ts
      end

      it "does not deliver a Slack message if member is not linked to Slack" do
        @slack_user_data.destroy!
        post = create(:post, organization: @member.organization)
        event = post.events.created_action.first!
        notification = create(:notification, organization_membership: @member, event: event)

        Slack::Web::Client.any_instance.expects(:chat_postMessage).never

        notification.deliver_slack_message!

        notification.reload
        assert_nil notification.slack_message_ts
      end

      it "does not deliver a Slack message if one was previously delivered" do
        slack_message_ts = "1234567890.123456"
        post = create(:post, organization: @member.organization)
        event = post.events.created_action.first!
        notification = create(:notification, organization_membership: @member, event: event, slack_message_ts: slack_message_ts)

        Slack::Web::Client.any_instance.expects(:chat_postMessage).never

        notification.deliver_slack_message!

        notification.reload
        assert_equal slack_message_ts, notification.slack_message_ts
      end
    end

    context "#delete_slack_message!" do
      it "deletes a Slack message if one was previously delivered" do
        slack_message_ts = "1234567890.123456"
        notification = create(:notification, organization_membership: @member, slack_message_ts: slack_message_ts)

        Slack::Web::Client.any_instance.expects(:chat_delete).with(channel: @member_slack_user_id, ts: slack_message_ts)

        notification.delete_slack_message!
      end

      it "does nothing if user has disconnected from Slack" do
        slack_message_ts = "1234567890.123456"
        notification = create(:notification, organization_membership: @member, slack_message_ts: slack_message_ts)
        @slack_user_data.destroy!

        Slack::Web::Client.any_instance.expects(:chat_delete).never

        notification.delete_slack_message!
      end

      it "does nothing if no Slack message was previously delivered" do
        notification = create(:notification, organization_membership: @member)

        Slack::Web::Client.any_instance.expects(:chat_delete).never

        notification.delete_slack_message!
      end
    end
  end

  context "#broadcast_new_notification" do
    test "broadcasts a new notification" do
      notification = create(:notification)
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
        notification.user.channel_name,
        "new-notification",
        { **NotificationSerializer.render_as_hash(notification), skip_push: false }.to_json,
      ])
    end

    test "includes skip_push: true if user has paused notifications" do
      member = create(:organization_membership, user: create(:user, notification_pause_expires_at: 1.day.from_now))
      notification = create(:notification, organization_membership: member)
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
        notification.user.channel_name,
        "new-notification",
        { **NotificationSerializer.render_as_hash(notification), skip_push: true }.to_json,
      ])
    end
  end

  context "#broadcast_notifications_stale" do
    test "broadcasts stale notifications when notification is discarded" do
      notification = create(:notification)
      notification.discard
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [notification.user.channel_name, "notifications-stale", nil.to_json])
    end

    test "broadcasts stale notifications when notification is destroyed" do
      notification = create(:notification)
      notification.destroy!
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [notification.user.channel_name, "notifications-stale", nil.to_json])
    end

    test "does not broadcast stale notifications when discarded notification is destroyed" do
      notification = create(:notification, :discarded)
      notification.destroy!
      refute_enqueued_sidekiq_job(PusherTriggerJob, args: [notification.user.channel_name, "notifications-stale", nil.to_json])
    end

    test "does not broadcast stale notifications when organization membership has been destroyed" do
      notification = create(:notification)
      notification.organization_membership.destroy!

      assert_nothing_raised do
        notification.reload.destroy!
      end
    end
  end

  context "#reaction" do
    test "returns the reaction if the subject is a Reaction" do
      reaction = create(:reaction)
      notification = build(:notification, event: build(:event, subject: reaction))

      assert_equal reaction, notification.reaction
    end

    test "returns nil if the subject is not a Reaction" do
      notification = build(:notification)

      assert_nil notification.reaction
    end
  end
end
