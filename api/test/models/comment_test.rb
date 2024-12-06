# frozen_string_literal: true

require "test_helper"

class CommentTest < ActiveSupport::TestCase
  test "#instrument_created_event" do
    org = create(:organization)
    post = create(:post, organization: org)
    comment_author_membership = create(:organization_membership, organization: org)
    comment = create(:comment, member: comment_author_membership, subject: post)

    assert_equal 1, comment.events.size
    event = comment.events.first!
    assert_equal "created", event.action
    assert_equal comment_author_membership, event.actor
    assert_enqueued_sidekiq_job(ProcessEventJob, args: [event.id])
  end

  test "#instrument_updated_event" do
    org = create(:organization)
    post = create(:post, organization: org)
    comment_author_membership = create(:organization_membership, organization: org)
    comment = create(:comment, member: comment_author_membership, subject: post)

    comment.update!(body_html: "<p>hey!</p>")

    assert_equal 1, comment.events.updated_action.size
    event = comment.events.updated_action.first!
    assert_equal comment_author_membership, event.actor
    assert_enqueued_sidekiq_job(ProcessEventJob, args: [event.id])
  end

  test "#instrument_destroyed_event" do
    org = create(:organization)
    post = create(:post, organization: org)
    comment_author_membership = create(:organization_membership, organization: org)
    comment = create(:comment, member: comment_author_membership, subject: post)

    comment.discard

    assert_equal 1, comment.events.destroyed_action.size
    event = comment.events.destroyed_action.first!
    assert_equal comment_author_membership, event.actor
    assert_enqueued_sidekiq_job(ProcessEventJob, args: [event.id])
  end

  context "#notification_summary" do
    before(:each) do
      @org = create(:organization)
      @notified = create(:organization_membership, organization: @org)
      @author = create(:organization_membership, organization: @org)
    end

    test "reply to notified's comment" do
      post = create(:post, organization: @org)
      parent = create(:comment, member: @notified, subject: post)
      comment = create(:comment, member: @author, parent: parent)
      event = create(:event, subject: comment)
      notification = create(:notification, :parent_subscription, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} replied to your comment", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|replied> to your comment", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " replied to " } },
        { text: { content: "your comment" } },
      ],
        summary.blocks
    end

    test "reply to author's comment" do
      post = create(:post, organization: @org)
      parent = create(:comment, member: @author, subject: post)
      comment = create(:comment, member: @author, parent: parent)
      event = create(:event, subject: comment)
      notification = create(:notification, :parent_subscription, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} replied to their comment", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|replied> to their comment", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " replied to " } },
        { text: { content: "their comment" } },
      ],
        summary.blocks
    end

    test "reply to other person's comment" do
      post = create(:post, organization: @org)
      parent = create(:comment, subject: post)
      comment = create(:comment, member: @author, parent: parent, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :parent_subscription, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} replied to #{parent.user.display_name}'s comment", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|replied> to #{parent.user.display_name}'s comment", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " replied to " } },
        { text: { content: "#{parent.user.display_name}'s", bold: true } },
        { text: { content: " comment" } },
      ],
        summary.blocks
    end

    test "reply to notified's post" do
      post = create(:post, member: @notified, organization: @org)
      comment = create(:comment, member: @author, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :parent_subscription, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} commented on #{post.title}", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|commented> on <#{post.url}|#{post.title}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " commented on " } },
        { text: { content: post.title, bold: true } },
      ],
        summary.blocks
    end

    test "reply to author's post" do
      post = create(:post, member: @author, organization: @org)
      comment = create(:comment, member: @author, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :parent_subscription, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} commented on #{post.title}", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|commented> on <#{post.url}|#{post.title}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " commented on " } },
        { text: { content: post.title, bold: true } },
      ],
        summary.blocks
    end

    test "integration reply to author's post" do
      post = create(:post, member: @notified, organization: @org)
      integration = create(:integration, :slack, owner: @org)
      comment = create(:comment, member: nil, integration: integration, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :parent_subscription, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "Slack commented on #{post.title}", summary.text
      assert_equal "Slack <#{comment.url}|commented> on <#{post.url}|#{post.title}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: "Slack", bold: true } },
        { text: { content: " commented on " } },
        { text: { content: post.title, bold: true } },
      ],
        summary.blocks
    end

    test "reply to other person's post" do
      post = create(:post, organization: @org)
      comment = create(:comment, member: @author, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :parent_subscription, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} commented on #{post.title}", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|commented> on <#{post.url}|#{post.title}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " commented on " } },
        { text: { content: post.title, bold: true } },
      ],
        summary.blocks
    end

    test "mention in reply to notified's comment" do
      post = create(:post, organization: @org)
      parent = create(:comment, member: @notified, subject: post)
      comment = create(:comment, member: @author, parent: parent, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :mention, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} mentioned you in a reply", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|mentioned you in a reply>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " mentioned you in a reply" } },
      ],
        summary.blocks
    end

    test "mention in reply to author's comment" do
      post = create(:post, organization: @org)
      parent = create(:comment, member: @author, subject: post)
      comment = create(:comment, member: @author, parent: parent, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :mention, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} mentioned you in a reply", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|mentioned you in a reply>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " mentioned you in a reply" } },
      ],
        summary.blocks
    end

    test "mention in a reply to other person's comment" do
      post = create(:post, organization: @org)
      parent = create(:comment, subject: post)
      comment = create(:comment, member: @author, parent: parent, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :mention, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} mentioned you in a reply", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|mentioned you in a reply>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " mentioned you in a reply" } },
      ],
        summary.blocks
    end

    test "mention in reply to notified's post" do
      post = create(:post, member: @notified, organization: @org)
      comment = create(:comment, member: @author, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :mention, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} mentioned you in a comment", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|mentioned you in a comment>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " mentioned you in a comment" } },
      ],
        summary.blocks
    end

    test "mention in reply to author's post" do
      post = create(:post, member: @author, organization: @org)
      comment = create(:comment, member: @author, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :mention, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} mentioned you in a comment", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|mentioned you in a comment>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " mentioned you in a comment" } },
      ],
        summary.blocks
    end

    test "mention in a reply to other person's post" do
      post = create(:post, organization: @org)
      comment = create(:comment, member: @author, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :mention, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} mentioned you in a comment", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|mentioned you in a comment>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " mentioned you in a comment" } },
      ],
        summary.blocks
    end

    test "mention in a reply to other person's post" do
      post = create(:post, organization: @org)
      comment = create(:comment, member: @author, subject: post)
      event = create(:event, subject: comment)
      notification = create(:notification, :mention, organization_membership: @notified, event: event, target: post)

      summary = comment.notification_summary(notification: notification)

      assert_equal "#{@author.display_name} mentioned you in a comment", summary.text
      assert_equal "#{@author.display_name} <#{comment.url}|mentioned you in a comment>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @author.display_name, bold: true } },
        { text: { content: " mentioned you in a comment" } },
      ],
        summary.blocks
    end
  end

  context "#notification_body_slack_blocks" do
    before(:each) do
      @comment = create(:comment, body_html: "<p>My comment</p>")
      @body_block = { type: "mrkdwn", text: "My comment" }
    end

    test "includes body block" do
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([@body_block])

      assert_equal [@body_block], @comment.notification_body_slack_blocks
    end

    test "includes preview file and context when present" do
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([@body_block])

      attachment_1 = create(:attachment, subject: @comment)
      create(:attachment, subject: @comment)

      expected = [
        @body_block,
        {
          type: "image",
          image_url: attachment_1.image_urls.slack_url,
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
      ]

      assert_equal expected, @comment.notification_body_slack_blocks
    end

    test "does not include attachment accessory for regular comments" do
      builder = Comment::BuildSlackBlocks.new(comment: @comment)
      assert builder.canvas_comment_accessory.nil?
    end

    test "safely fails when attachment has no dimensions" do
      post = create(:post)
      attachment = create(:attachment, subject: post)
      comment = create(:comment, subject: post, attachment: attachment, x: 100, y: 100)
      builder = Comment::BuildSlackBlocks.new(comment: comment)

      assert builder.canvas_comment_accessory.nil?
    end

    test "includes attachment accessory when canvas comment exists" do
      post = create(:post)
      attachment = create(:attachment, subject: post, width: 1000, height: 1000)
      comment = create(:comment, subject: post, attachment: attachment, x: 100, y: 100)
      builder = Comment::BuildSlackBlocks.new(comment: comment)

      assert_not builder.canvas_comment_accessory.nil?
    end

    test "canvas preview url respects small width" do
      post = create(:post)
      attachment = create(:attachment, subject: post, width: 50, height: 1000)
      comment = create(:comment, subject: post, attachment: attachment, x: 100, y: 100)
      assert_includes comment.canvas_preview_url(100), "w=50"
      assert_includes comment.canvas_preview_url(100), "h=50"
    end

    test "canvas preview url respects small height" do
      post = create(:post)
      attachment = create(:attachment, subject: post, width: 1000, height: 50)
      comment = create(:comment, subject: post, attachment: attachment, x: 100, y: 100)
      assert_includes comment.canvas_preview_url(100), "w=50"
      assert_includes comment.canvas_preview_url(100), "h=50"
    end

    test "merges attachment accessory with the first body block" do
      post = create(:post)
      attachment = create(:attachment, subject: post, width: 1000, height: 1000)
      comment = create(:comment, subject: post, attachment: attachment, x: 100, y: 100)

      StyledText.any_instance.expects(:html_to_slack_blocks).returns([@body_block])

      assert comment.notification_body_slack_blocks.first[:accessory].present?
    end
  end

  context "#build_slack_blocks" do
    before(:each) do
      @comment = create(:comment, body_html: "<p>My comment</p>")
      @body_block = { type: "mrkdwn", text: "My comment" }
    end

    test "includes title, body, and action blocks" do
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([@body_block])

      expected = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*#{@comment.user.display_name}* commented on <#{@comment.subject.url}|#{@comment.subject.title}>:",
          },
        },
        @body_block,
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View comment",
              },
              action_id: @comment.public_id,
              url: @comment.url,
            },
          ],
        },
      ]

      assert_equal expected, @comment.build_slack_blocks
    end

    test "includes preview file and context when present" do
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([@body_block])

      attachment_1 = create(:attachment, subject: @comment)
      create(:attachment, subject: @comment)

      expected = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*#{@comment.user.display_name}* commented on <#{@comment.subject.url}|#{@comment.subject.title}>:",
          },
        },
        @body_block,
        {
          type: "image",
          image_url: attachment_1.image_urls.slack_url,
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
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View comment",
              },
              action_id: @comment.public_id,
              url: @comment.url,
            },
          ],
        },
      ]

      assert_equal expected, @comment.build_slack_blocks
    end
  end

  context "#slack_body_html" do
    test "converts link unfurls to links" do
      html = <<~HTML.squish
        <link-unfurl href="https://campsite.com"></link-unfurl>
        <link-unfurl href="https://google.com"></link-unfurl>
      HTML
      comment = build(:comment, body_html: html)

      expected = <<~HTML.squish
        <a href="https://campsite.com">https://campsite.com</a> <a href="https://google.com">https://google.com</a>
      HTML

      assert_equal expected, comment.slack_body_html
    end
  end

  context "#tasks" do
    test "updates task status to checked" do
      html = <<~HTML.strip
          <ul class="task-list" data-type="taskList">
          <li class="task-item" data-checked="false" data-type="taskItem">
            <label><input type="checkbox"><span></span></label>
            <div><p>Unchecked</p></div>
          </li>
          <li class="task-item" data-checked="true" data-type="taskItem">
            <label><input type="checkbox" checked="checked"><span></span></label>
            <div><p>Checked</p></div>
          </li>
        </ul>
      HTML
      comment = create(:comment, body_html: html)
      comment.update_task(index: 0, checked: true)

      doc = Nokogiri::HTML.fragment(comment.body_html)

      inputs = doc.css("input")
      lis = doc.css("li")

      assert_equal 2, inputs.count
      assert_equal 2, lis.count

      assert "true", lis[0].attr("data-checked")
      assert "true", lis[1].attr("data-checked")

      assert_equal "checked", inputs[0].attr("checked")
      assert_equal "checked", inputs[1].attr("checked")
    end

    test "updates task status to unchecked" do
      html = <<~HTML.strip
          <ul class="task-list" data-type="taskList">
          <li class="task-item" data-checked="false" data-type="taskItem">
            <label><input type="checkbox"><span></span></label>
            <div><p>Unchecked</p></div>
          </li>
          <li class="task-item" data-checked="true" data-type="taskItem">
            <label><input type="checkbox" checked="checked"><span></span></label>
            <div><p>Checked</p></div>
          </li>
        </ul>
      HTML
      comment = create(:comment, body_html: html)
      comment.update_task(index: 1, checked: false)

      doc = Nokogiri::HTML.fragment(comment.body_html)

      inputs = doc.css("input")
      lis = doc.css("li")

      assert_equal 2, inputs.count
      assert_equal 2, lis.count

      assert "false", lis[0].attr("data-checked")
      assert "false", lis[1].attr("data-checked")

      assert_not_equal "checked", inputs[0].attr("checked")
      assert_not_equal "checked", inputs[1].attr("checked")
    end
  end

  context ".not_private" do
    test "returns comments not belonging to posts in private projects" do
      project = create(:project, private: true)
      post = create(:post, project: project)
      private_comment = create(:comment, subject: post)
      public_comment = create(:comment)

      results = Comment.not_private

      assert_includes results, public_comment
      assert_not_includes results, private_comment
    end
  end

  context "#counter_culture" do
    test "updates post counts" do
      post = create(:post)
      assert_equal 0, post.comments_count
      create_list(:comment, 3, subject: post)
      assert_equal 3, post.reload.comments_count
    end

    test "updates post resolved comment counts" do
      post = create(:post)
      assert_equal 0, post.resolved_comments_count
      create_list(:comment, 3, subject: post)
      assert_equal 0, post.reload.resolved_comments_count
      post.comments[0].resolve!(actor: post.member)
      post.comments[1].resolve!(actor: post.member)
      assert_equal 2, post.reload.resolved_comments_count
    end

    test "updates note counts" do
      note = create(:note)
      assert_equal 0, note.comments_count
      create_list(:comment, 3, subject: note)
      assert_equal 3, note.reload.comments_count
    end

    test "updates note resolved comment counts" do
      note = create(:note)
      assert_equal 0, note.resolved_comments_count
      create_list(:comment, 3, subject: note)
      assert_equal 0, note.reload.resolved_comments_count
      note.comments[0].resolve!(actor: note.member)
      note.comments[1].resolve!(actor: note.member)
      assert_equal 2, note.reload.resolved_comments_count
    end

    test "updates replies count" do
      parent = create(:comment)
      children = create_list(:comment, 3, parent: parent)
      assert_equal 3, parent.reload.replies_count

      children[0].discard
      assert_equal 2, parent.reload.replies_count
    end
  end

  context "#post_preview_text" do
    test "when no text and only an attachment" do
      user = create(:user, name: "User Name")
      comment = create(:comment, body_html: "", member: create(:organization_membership, user: user))
      create(:attachment, subject: comment)
      assert_equal "User Name shared an attachment", comment.post_preview_text
    end

    test "fallback when no text or attachment" do
      user = create(:user, name: "User Name")
      comment = create(:comment, body_html: "", member: create(:organization_membership, user: user))
      assert_equal "User Name posted a comment", comment.post_preview_text
    end

    test "single line text content" do
      user = create(:user, name: "User Name")
      comment = create(:comment, body_html: "<p>Love that for you</p>", member: create(:organization_membership, user: user))
      assert_equal "User Name: Love that for you", comment.post_preview_text
    end

    test "adds ellipsis when there is more text content" do
      user = create(:user, name: "User Name")
      comment = create(:comment, body_html: "<p>Love that for you</p><p>But do you think it's a good idea?</p>", member: create(:organization_membership, user: user))
      assert_equal "User Name: Love that for you...", comment.post_preview_text
    end

    test "truncates long text" do
      user = create(:user, name: "User Name")
      body_html = <<~HTML.squish
        <p>Laborum et eu veniam ut amet eu. In excepteur id fugiat mollit laboris duis amet laborum occaecat. Duis anim et nostrud quis adipisicing tempor laboris sit mollit. Dolore magna quis ea ipsum sint anim. Consectetur dolor tempor enim et ad Lorem dolore. Esse nulla commodo ad minim. Eu ipsum Lorem excepteur tempor officia excepteur fugiat eu labore proident Lorem incididunt esse adipisicing mollit. Adipisicing ullamco eiusmod in ad deserunt nostrud laboris ipsum anim exercitation magna consectetur adipisicing.</p>
      HTML
      comment = create(:comment, body_html: body_html, member: create(:organization_membership, user: user))
      assert_equal "User Name: Laborum et eu veniam ut amet eu. In excepteur id fugiat mollit laboris duis amet laborum occaecat. Duis anim et nostrud quis adipisicing...", comment.post_preview_text
    end
  end

  context "#export_json" do
    test "exports metadata" do
      comment = create(:comment, body_html: "<p>My comment</p>")
      create_list(:comment, 3, parent: comment)
      export = comment.export_json
      assert_equal 3, export[:replies].count
      assert_equal comment.public_id, export[:id]
      assert_equal "My comment", export[:body]
    end

    test "comment from integration" do
      comment = create(:comment, :from_integration)
      export = comment.export_json
      assert_equal "integration", export[:author][:type]
    end

    test "comment from oauth application" do
      comment = create(:comment, :from_oauth_application)
      export = comment.export_json
      assert_equal "oauth_application", export[:author][:type]
    end
  end
end
