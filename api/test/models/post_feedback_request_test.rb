# frozen_string_literal: true

require "test_helper"

class PostFeedackRequestTest < ActiveSupport::TestCase
  context "#notification_summary" do
    test "includes requester's name" do
      feedback_request = create(:post_feedback_request)
      event = create(:event, subject: feedback_request)
      notification = create(:notification, event: event, organization_membership: feedback_request.member)

      summary = feedback_request.notification_summary(notification: notification)

      assert_equal "#{feedback_request.post.user.display_name} requested your feedback", summary.text
      assert_equal "#{feedback_request.post.user.display_name} requested your feedback", summary.slack_mrkdwn
    end
  end

  context "#notification_body_slack_blocks" do
    before(:each) do
      post = create(:post, description_html: "<p>My post</p>")
      @feedback_request = create(:post_feedback_request, post: post)
      @description_block = { type: "mrkdwn", text: "My post" }
      @project_block = { type: "context", elements: [{ type: "mrkdwn", text: "Posted in <#{post.project.url}|#{post.project.name}>" }] }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([@description_block])
    end

    test "includes description block" do
      assert_equal [@description_block, @project_block], @feedback_request.notification_body_slack_blocks
    end

    test "includes preview file and context when present" do
      post_file_1 = create(:attachment, subject: @feedback_request.post)
      create(:attachment, subject: @feedback_request.post)

      expected = [
        @description_block,
        {
          type: "image",
          image_url: post_file_1.image_urls.slack_url,
          alt_text: "Uploaded preview",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "+1 more attachment",
            },
          ],
        },
        @project_block,
      ]

      assert_equal expected, @feedback_request.notification_body_slack_blocks
    end
  end

  context "#notification_summary" do
    before(:each) do
      @org = create(:organization)
      @notified = create(:organization_membership, organization: @org)
      @author = create(:organization_membership, organization: @org)
      @project = create(:project, organization: @org)
      @post = create(:post, organization: @org, member: @author, project: @project)
      @post_feedback_request = create(:post_feedback_request, post: @post, member: @author)
      @event = create(:event, subject: @post)
    end

    test "feedback requested" do
      notification = create(:notification, organization_membership: @notified, event: @event, target: @post_feedback_request.post)

      summary = @post_feedback_request.notification_summary(notification: notification)

      assert_equal "#{@post.user.display_name} requested your feedback", summary.text
      assert_equal "#{@post.user.display_name} requested your feedback", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @post.user.display_name, bold: true } },
        { text: { content: " requested your feedback" } },
      ],
        summary.blocks
    end
  end
end
