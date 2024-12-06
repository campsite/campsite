# frozen_string_literal: true

require "test_helper"

class SharePostToSlackJobTest < ActiveJob::TestCase
  context "#perform" do
    test "shares a post by another author" do
      post = create(:post, description_html: "<p>My post</p>")
      user = create(:user)
      slack_channel_id = "channel-id"
      description_block = { type: "mrkdwn", text: "My post" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])

      expected = {
        text: "#{user.display_name} shared a post by #{post.user.display_name}",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{user.display_name}* shared a post by *#{post.user.display_name}*:" } },
          { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } },
          description_block,
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Posted in <#{post.project.url}|#{post.project.name}>",
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View post" },
                action_id: post.public_id,
                url: post.url,
              },
            ],
          },
        ],
        link_names: true,
        unfurl_links: false,
        channel: slack_channel_id,
      }

      Slack::Web::Client.any_instance.expects(:chat_postMessage).with(expected).returns({ "ts" => "123" })
      Slack::Web::Client.any_instance.expects(:chat_getPermalink).returns({ "permalink" => "https://example.com" })

      SharePostToSlackJob.new.perform(post.id, user.id, slack_channel_id)
    end

    test "shares a post where sharer is author" do
      post = create(:post, description_html: "<p>My post</p>")
      slack_channel_id = "channel-id"
      description_block = { type: "mrkdwn", text: "My post" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])

      expected = {
        text: "#{post.user.display_name} shared a post",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared a post:" } },
          { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } },
          description_block,
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Posted in <#{post.project.url}|#{post.project.name}>",
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View post" },
                action_id: post.public_id,
                url: post.url,
              },
            ],
          },
        ],
        link_names: true,
        unfurl_links: false,
        channel: slack_channel_id,
      }

      Slack::Web::Client.any_instance.expects(:chat_postMessage).with(expected).returns({ "ts" => "123" })
      Slack::Web::Client.any_instance.expects(:chat_getPermalink).returns({ "permalink" => "https://example.com" })

      SharePostToSlackJob.new.perform(post.id, post.user.id, slack_channel_id)
    end

    test "indicates when there's a poll" do
      post = create(:post, :with_poll, description_html: "<p>My post</p>")
      user = create(:user)
      slack_channel_id = "channel-id"
      description_block = { type: "mrkdwn", text: "My post" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])

      expected = {
        text: "#{user.display_name} shared a poll by #{post.user.display_name}",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{user.display_name}* shared a poll by *#{post.user.display_name}*:" } },
          { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } },
          description_block,
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Posted in <#{post.project.url}|#{post.project.name}>",
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View post" },
                action_id: post.public_id,
                url: post.url,
              },
            ],
          },
        ],
        link_names: true,
        unfurl_links: false,
        channel: slack_channel_id,
      }

      Slack::Web::Client.any_instance.expects(:chat_postMessage).with(expected).returns({ "ts" => "123" })
      Slack::Web::Client.any_instance.expects(:chat_getPermalink).returns({ "permalink" => "https://example.com" })

      SharePostToSlackJob.new.perform(post.id, user.id, slack_channel_id)
    end

    test "allows link unfurling when post has a single unfurled link" do
      post = create(:post, description_html: "<p>My post with a <a href=\"https://apple.com\">link</a></p>", unfurled_link: "https://apple.com")
      slack_channel_id = "channel-id"
      description_block = { type: "mrkdwn", text: "My post with a <link|https://apple.com>" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])

      expected = {
        text: "#{post.user.display_name} shared a post",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared a post:" } },
          { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } },
          description_block,
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Posted in <#{post.project.url}|#{post.project.name}>",
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View post" },
                action_id: post.public_id,
                url: post.url,
              },
            ],
          },
        ],
        link_names: true,
        unfurl_links: true,
        channel: slack_channel_id,
      }

      Slack::Web::Client.any_instance.expects(:chat_postMessage).with(expected).returns({ "ts" => "123" })
      Slack::Web::Client.any_instance.expects(:chat_getPermalink).returns({ "permalink" => "https://example.com" })

      SharePostToSlackJob.new.perform(post.id, post.user.id, slack_channel_id)
    end
  end
end
