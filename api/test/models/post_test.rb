# frozen_string_literal: true

require "test_helper"

class PostTest < ActiveSupport::TestCase
  context "#slack_channel_ids" do
    test "does not return the org slack channel id" do
      organization = create(:organization, slack_channel_id: "1234567890.0000")
      post = create(:post, organization: organization)
      assert_empty post.slack_channel_ids
    end

    test "returns the project slack channel id when there is an org slack channel" do
      organization = create(:organization, slack_channel_id: "1234567890.0000")
      project = create(:project, slack_channel_id: "0987654321.0000", organization: organization)
      post = create(:post, project: project, organization: organization)

      assert_equal ["0987654321.0000"], post.slack_channel_ids
    end

    test "returns an empty array if no slack channel id exists" do
      post = create(:post)
      assert_empty post.slack_channel_ids
    end

    test "returns uniq slack ids" do
      organization = create(:organization, slack_channel_id: "1234567890.0000")
      project = create(:project, slack_channel_id: "1234567890.0000", organization: organization)
      post = create(:post, project: project, organization: organization)

      assert_equal ["1234567890.0000"], post.slack_channel_ids
    end
  end

  context "#slackable?" do
    test "returns true if post is slackable" do
      organization = create(:organization)
      project = create(:project, organization: organization, slack_channel_id: "0987654321.12345")
      create(:integration, :slack, owner: organization)
      post = create(:post, organization: organization, project: project)
      assert_predicate post, :slackable?
    end

    test "returns false if post is not slackable" do
      post = create(:post)
      assert_not_predicate post, :slackable?
    end
  end

  context "#build_slack_message" do
    test "returns the expected body with image and video attachments" do
      post = create(:post, description_html: "<p>foo bar</p>")
      title_block = { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } }
      description_block = { type: "mrkdwn", text: "foo bar" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])
      create(:attachment, :video, subject: post, position: 2)
      image_attachment = create(:attachment, subject: post, position: 1)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared #{post.attachments.count} attachments:" } },
          title_block,
          description_block,
          { type: "image", image_url: image_attachment.image_urls.slack_url, alt_text: "Uploaded preview" },
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
      }
      assert_equal expected, post.build_slack_message
    end

    test "returns the expected body with video and image and origami, principle and lottie attachments" do
      post = create(:post, description_html: "<p>foo bar</p>")
      title_block = { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } }
      description_block = { type: "mrkdwn", text: "foo bar" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])
      image_attachment = create(:attachment, subject: post)
      create(:attachment, :video, subject: post)
      create(:attachment, :origami, subject: post)
      create(:attachment, :principle, subject: post)
      create(:attachment, :lottie, subject: post)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared #{post.attachments.count} attachments:" } },
          title_block,
          description_block,
          { type: "image", image_url: image_attachment.image_urls.slack_url, alt_text: "Uploaded preview" },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "+#{post.attachments.count - 1} more attachments",
              },
            ],
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
      }
      assert_equal expected, post.build_slack_message
    end

    test "returns the expected body with video before an image" do
      post = create(:post, description_html: "<p>foo bar</p>")
      title_block = { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } }
      description_block = { type: "mrkdwn", text: "foo bar" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])
      video_attachment = create(:attachment, :video, subject: post)
      create(:attachment, subject: post)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared #{post.attachments.count} attachments:" } },
          title_block,
          description_block,
          { type: "image", image_url: video_attachment.resize_preview_url(1200), alt_text: "Uploaded preview" },
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
      }
      assert_equal expected, post.build_slack_message
    end

    test "returns the expected body with multiple image attachments" do
      post = create(:post, description_html: "<p>foo bar</p>")
      title_block = { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } }
      description_block = { type: "mrkdwn", text: "foo bar" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])
      image_attachment = create(:attachment, subject: post)
      create(:attachment, subject: post)
      create(:attachment, subject: post)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared #{post.attachments.count} attachments:" } },
          title_block,
          description_block,
          { type: "image", image_url: image_attachment.image_urls.slack_url, alt_text: "Uploaded preview" },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "+#{post.attachments.count - 1} more attachments",
              },
            ],
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
      }
      assert_equal expected, post.build_slack_message
    end

    test "returns the expected body without a description" do
      post = create(:post, description_html: nil)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared:" } },
          { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } },
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
      }

      VCR.use_cassette("html_to_slack/no_description") do
        assert_equal expected, post.build_slack_message
      end
    end

    test "returns the expected body with figma links" do
      post = create(:post, description_html: "<p>foo bar</p>")
      title_block = { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } }
      description_block = { type: "mrkdwn", text: "foo bar" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])
      figma_link = create(:post_link, post: post, url: "https://fancy.figma.com")
      create(:post_link, post: post, url: "https://random.link.com")

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared:" } },
          title_block,
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
              {
                type: "button",
                text: { type: "plain_text", text: "View on Figma" },
                action_id: figma_link.public_id,
                url: figma_link.url,
              },
            ],
          },
        ],
        link_names: true,
        unfurl_links: false,
      }
      assert_equal expected, post.build_slack_message
    end

    test "returns formatted mentions and links" do
      member = create(:organization_membership, user: create(:user, username: "joe", name: "Joe Schmoe"))
      mention = MentionsFormatter.format_mention(member)
      description_html =
        <<~HTML.squish
          <p>Hey #{mention}, check out this <a href="https://example.com">link</a></p>
        HTML
      post = create(:post, description_html: description_html, organization: create(:organization, slug: "foo-bar"))

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared:" } },
          { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } },
          { type: "section", text: { type: "mrkdwn", text: "Hey <http://app.campsite.test:3000/foo-bar/people/joe|@Joe Schmoe>, check out this <https://example.com|link>", verbatim: true } },
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
      }

      VCR.use_cassette("html_to_slack/formatted_mentions_links_and_note_attachments") do
        assert_equal expected, post.build_slack_message
      end
    end

    test "falls back to plain text when StyledText is unavailable" do
      member = create(:organization_membership, user: create(:user, username: "joe", name: "Joe Schmoe"))
      mention = MentionsFormatter.format_mention(member)
      description_html = "<p>Hey #{mention}, check out this <a href=\"https://example.com\">link</a></p>"
      post = create(:post, description_html: description_html)
      StyledText.any_instance.expects(:html_to_slack_blocks).raises(StyledText::ConnectionFailedError)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared:" } },
          { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } },
          { type: "section", text: { type: "mrkdwn", text: "Hey @Joe Schmoe, check out this link" } },
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
      }

      assert_equal expected, post.build_slack_message
    end

    test "returns the expected body with a parent post" do
      parent = create(:post)
      post = create(:post, parent: parent, description_html: "<p>My post</p>")
      title_block = { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } }
      description_block = { type: "mrkdwn", text: "My post" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared v#{post.version} of a post:" } },
          title_block,
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
              {
                type: "button",
                text: { type: "plain_text", text: "View v#{post.version - 1}" },
                action_id: post.parent.public_id,
                url: post.parent.url,
              },
            ],
          },
        ],
        link_names: true,
        unfurl_links: false,
      }
      assert_equal expected, post.build_slack_message
    end

    test "includes the project" do
      project = create(:project)
      post = create(:post, project: project, description_html: "<p>My post</p>")
      title_block = { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } }
      description_block = { type: "mrkdwn", text: "My post" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared:" } },
          title_block,
          description_block,
          { type: "context", elements: [{ type: "mrkdwn", text: "Posted in <#{project.url}|#{project.name}>" }] },
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
      }

      assert_equal expected, post.build_slack_message
    end

    test "returns formatted tags" do
      tag = create(:tag)
      post = create(:post, tags: [tag], description_html: "<p>My post</p>")
      title_block = { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } }
      description_block = { type: "mrkdwn", text: "My post" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared:" } },
          title_block,
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
          { type: "context", elements: [{ type: "mrkdwn", text: "<#{tag.url}|##{tag.name}>" }] },
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
      }
      assert_equal expected, post.build_slack_message
    end

    test "returns the title and description if there are no attachments" do
      post = create(:post, description_html: "<p>paragraph1</p><p>paragraph2</p>")
      description_block1 = { type: "section", text: { type: "mrkdwn", text: "paragraph1", verbatim: true } }
      description_block2 = { type: "section", text: { type: "mrkdwn", text: "paragraph2", verbatim: true } }
      StyledText.any_instance.expects(:html_to_slack_blocks).with(post.description_html).returns([description_block1, description_block2])

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared:" } },
          { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } },
          description_block1,
          description_block2,
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
      }
      assert_equal expected, post.build_slack_message
    end

    test "returns the title and description if there are attachments" do
      post = create(:post)
      description_block1 = { type: "section", text: { type: "mrkdwn", text: "paragraph1", verbatim: true } }
      description_block2 = { type: "section", text: { type: "mrkdwn", text: "paragraph2", verbatim: true } }
      StyledText.any_instance.expects(:html_to_slack_blocks).with(post.description_html).returns([description_block1, description_block2])
      image_attachment = create(:attachment, subject: post)
      create(:attachment, subject: post)
      create(:attachment, subject: post)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared #{post.attachments.count} attachments:" } },
          { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } },
          description_block1,
          description_block2,
          { type: "image", image_url: image_attachment.image_urls.slack_url, alt_text: "Uploaded preview" },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "+#{post.attachments.count - 1} more attachments",
              },
            ],
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
      }
      assert_equal expected, post.build_slack_message
    end

    test "includes kept feedback requests" do
      post = create(:post, description_html: "<p>My post</p>")
      create(:post_feedback_request, post: post)
      create(:post_feedback_request, post: post, discarded_at: 1.hour.ago)
      title_block = { type: "section", text: { type: "mrkdwn", text: "<#{post.url}|*#{post.title}*>" } }
      description_block = { type: "mrkdwn", text: "My post" }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([description_block])

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*#{post.user.display_name}* shared:" } },
          title_block,
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
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Feedback requests:*\n• Harry Potter",
            },
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
      }

      assert_equal expected, post.build_slack_message
    end

    test "updates the CTA when in feedback_requested status" do
      post = create(:post, status: :feedback_requested)
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([])

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*#{post.user.display_name}* shared:",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "<#{post.url}|*#{post.title}*>",
            },
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
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Add feedback",
                },
                action_id: post.public_id,
                url: post.url,
              },
            ],
          },
        ],
        link_names: true,
        unfurl_links: false,
      }

      assert_equal expected, post.build_slack_message
    end

    test "truncates the description when it would exceed the Slack message block limit" do
      post = create(:post)
      blocks = Array.new((Post::BuildSlackBlocks::MAX_DESCRIPTION_BLOCKS + 1)) { { type: "section", text: { type: "mrkdwn", text: "a" } }.dup }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns(blocks)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*#{post.user.display_name}* shared:",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "<#{post.url}|*#{post.title}*>",
            },
          },
          blocks[0..(Post::BuildSlackBlocks::MAX_DESCRIPTION_BLOCKS - 2)],
          {
            type: "section",
            text: { type: "mrkdwn", text: "a…" },
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
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View full post",
                },
                action_id: post.public_id,
                url: post.url,
              },
            ],
          },
        ].flatten,
        link_names: true,
        unfurl_links: false,
      }

      assert_equal expected, post.build_slack_message
    end

    test "truncates description to max blocks" do
      post = create(:post)
      blocks = Array.new(10) { { type: "section", text: { type: "mrkdwn", text: "a" } }.dup }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns(blocks)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*#{post.user.display_name}* shared:",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "<#{post.url}|*#{post.title}*>",
            },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: "a" },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: "a…" },
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
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View full post",
                },
                action_id: post.public_id,
                url: post.url,
              },
            ],
          },
        ].flatten,
        link_names: true,
        unfurl_links: false,
      }

      assert_equal expected, post.build_slack_message
    end

    test "returns the expected body for a truncated post with a poll" do
      post = create(:post, :with_poll)
      blocks = Array.new(10) { { type: "section", text: { type: "mrkdwn", text: "a" } }.dup }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns(blocks)

      expected = {
        text: "#{post.user.display_name} shared work in progress",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*#{post.user.display_name}* shared a poll:",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "<#{post.url}|*#{post.title}*>",
            },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: "a" },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: "a…" },
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
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View full post",
                },
                action_id: post.public_id,
                url: post.url,
              },
            ],
          },
        ].flatten,
        link_names: true,
        unfurl_links: false,
      }

      assert_equal expected, post.build_slack_message
    end

    test "works for a post created by an oauth application" do
      post = create(:post, :from_oauth_application)
      description_block1 = { type: "section", text: { type: "mrkdwn", text: "paragraph1", verbatim: true } }
      description_block2 = { type: "section", text: { type: "mrkdwn", text: "paragraph2", verbatim: true } }
      StyledText.any_instance.expects(:html_to_slack_blocks).with(post.description_html).returns([description_block1, description_block2])

      assert_equal "#{post.author.display_name} shared work in progress", post.build_slack_message[:text]
    end

    test "works for a post created by an integration" do
      post = create(:post, :from_integration)
      description_block1 = { type: "section", text: { type: "mrkdwn", text: "paragraph1", verbatim: true } }
      description_block2 = { type: "section", text: { type: "mrkdwn", text: "paragraph2", verbatim: true } }
      StyledText.any_instance.expects(:html_to_slack_blocks).with(post.description_html).returns([description_block1, description_block2])

      assert_equal "#{post.author.display_name} shared work in progress", post.build_slack_message[:text]
    end
  end

  context "#slack_description_html" do
    test "converts link unfurls to links" do
      html = <<~HTML.squish
        <link-unfurl href="https://campsite.com"></link-unfurl>
        <link-unfurl href="https://google.com"></link-unfurl>
      HTML
      post = build(:post, description_html: html)

      expected = <<~HTML.squish
        <a href="https://campsite.com">https://campsite.com</a> <a href="https://google.com">https://google.com</a>
      HTML

      assert_equal expected, post.slack_description_html
    end
  end

  context "#create_slack_message!" do
    test "creates a slack link" do
      organization = create(:organization, slack_channel_id: "1234567890.12345")
      post = create(:post, organization: organization, description_html: "<p>My post</p>")
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([{ type: "mrkdwn", text: "My post" }])
      Slack::Web::Client.any_instance.expects(:chat_postMessage).returns({ "ts" => "1000.0000" })
      Slack::Web::Client.any_instance.expects(:chat_getPermalink).returns({ "permalink" => "https://slack.com/archive/path/to/message" })

      post.create_slack_message!(organization.slack_channel_id)

      link = post.links.first
      assert_equal "https://slack.com/archive/path/to/message", link.url
      assert_equal "slack", link.name
    end
  end

  context "#url" do
    test "returns the campsite app post url" do
      post = create(:post)
      assert_equal "http://app.campsite.test:3000/#{post.organization.slug}/posts/#{post.public_id}", post.url
    end
  end

  context "#thumbnail_url" do
    test "for a post with no attachments" do
      post = create(:post)

      assert_nil post.thumbnail_url
    end

    test "for a post with a video" do
      post = create(:post)
      attachment = create(:attachment, :video, subject: post)

      assert_equal "http://campsite-test.imgix.net#{attachment.preview_file_path}?auto=compress&dpr=2&w=48", post.thumbnail_url
    end

    test "for a post with a Figma file with a preview_file_path" do
      post = create(:post)
      attachment = create(:attachment, :figma_link, subject: post, preview_file_path: "/o/foo/bar")

      assert_equal "http://campsite-test.imgix.net#{attachment.preview_file_path}?auto=compress&dpr=2&w=48", post.thumbnail_url
    end

    test "for a post with a Figma file without a preview_file_path" do
      post = create(:post)
      create(:attachment, :figma_link, subject: post)

      assert_nil post.thumbnail_url
    end

    test "for a post with a gif" do
      post = create(:post)
      attachment = create(:attachment, :gif, subject: post)

      assert_equal "http://campsite-test.imgix.net#{attachment.file_path}?auto=compress&dpr=2&frame=1&h=48&w=48", post.thumbnail_url
    end

    test "for a post with a png" do
      post = create(:post)
      attachment = create(:attachment, subject: post)

      assert_equal "http://campsite-test.imgix.net#{attachment.file_path}?auto=compress%2Cformat&dpr=2&q=60&w=112", post.thumbnail_url
    end

    test "for a post with an svg" do
      post = create(:post)
      attachment = create(:attachment, :svg, subject: post)

      assert_equal "http://campsite-test.imgix.net#{attachment.file_path}?auto=compress%2Cformat&dpr=2&q=60&w=112", post.thumbnail_url
    end
  end

  context "#enqueue_delete_slack_message_job" do
    test "enqueues DeleteSlackMessageJob if post has a slack links" do
      Post.any_instance.stubs(:slack_message?).returns(true)
      post = create(:post, slack_message_ts: "slack-message-id")
      first_link = create(:post_link, :slack, post: post, url: "https://campsite-software.slack.com/archives/C0ABCDE1234/p1234567890796459")
      second_link = create(:post_link, :slack, post: post, url: "https://campsite-software.slack.com/archives/C0EFGHI1234/p1234567890796459")
      post.discard

      assert_enqueued_sidekiq_job(
        DeleteSlackMessageJob,
        args: [post.organization.id, first_link.slack_channel_id, first_link.slack_message_ts],
      )

      assert_enqueued_sidekiq_job(
        DeleteSlackMessageJob,
        args: [post.organization.id, second_link.slack_channel_id, second_link.slack_message_ts],
      )
    end

    test "does not enqueue DeleteSlackMessageJob if post no slack links" do
      assert_enqueued_sidekiq_jobs(0, only: DeleteSlackMessageJob) do
        post = create(:post)
        post.discard
      end
    end
  end

  context "#subscribed?" do
    setup do
      @post = create(:post)
      @subscriber = create(:user)
    end

    test "returns true if the user is subcribed to a post" do
      @post.subscriptions.create!(user: @subscriber)

      assert @post.subscribed?(@subscriber)
    end

    test "returns false if a user is not subscribed to a post" do
      assert_not @post.subscribed?(@subscriber)
    end
  end

  context "#remove_from_version_tree" do
    test "removes post from version tree on discard" do
      parent = create(:post)
      child = create(:post, parent: parent)

      child.discard
      child.reload
      parent.reload

      assert_not_predicate parent, :discarded?
      assert_predicate child, :discarded?

      assert_not_predicate parent, :stale
    end

    test "discards all of the subsequent posts in the version tree" do
      parent = create(:post)
      child = create(:post, parent: parent)
      grandchild = create(:post, parent: child)

      child.discard

      grandchild.reload
      child.reload
      parent.reload

      assert_not_predicate parent, :discarded?
      assert_predicate child, :discarded?
      assert_predicate grandchild, :discarded?

      assert_not_predicate parent, :stale
    end
  end

  context "#versions" do
    test "returns all of the versions associated with this post if the post is the root" do
      parent = create(:post)
      child = create(:post, parent: parent)
      grandchild = create(:post, parent: child)

      assert_equal 1, parent.version
      assert_equal 2, child.version
      assert_equal 3, grandchild.version
    end

    test "returns all of the versions associated with this post if the post is in the middle" do
      parent = create(:post)
      child = create(:post, parent: parent)
      grandchild = create(:post, parent: child)

      assert_equal 1, parent.version
      assert_equal 2, child.version
      assert_equal 3, grandchild.version
    end

    test "returns all of the versions associated with this post if the post a leaf" do
      parent = create(:post)
      child = create(:post, parent: parent)
      grandchild = create(:post, parent: child)

      assert_equal 1, parent.version
      assert_equal 2, child.version
      assert_equal 3, grandchild.version
    end

    test "returns all of the versions associated with this post if the post is discarded" do
      parent = create(:post)
      child = create(:post, parent: parent)
      grandchild = create(:post, parent: child)

      assert_equal 1, parent.version
      assert_equal 2, child.version
      assert_equal 3, grandchild.version
    end
  end

  context "#set_root_id" do
    test "sets the root_id to the parent's root_id if the post has a parent" do
      parent = create(:post)
      child = create(:post, parent: parent)
      grandchild = create(:post, parent: child)

      assert_nil parent.root_id
      assert_equal parent.id, child.root_id
      assert_equal parent.id, grandchild.root_id
    end
  end

  context "#set_version" do
    test "sets the version to the parent's version + 1 if the post has a parent" do
      parent = create(:post)
      child = create(:post, parent: parent)
      grandchild = create(:post, parent: child)

      assert_equal 1, parent.version
      assert_equal 2, child.version
      assert_equal 3, grandchild.version
    end

    test "sets the version to parent's version + 1 if parent has a child but child is discarded" do
      parent = create(:post)
      child_1 = create(:post, parent: parent)
      child_1.discard
      child_2 = create(:post, parent: parent)

      assert_equal 1, parent.version
      assert_equal 2, child_1.version
      assert_equal 2, child_2.version
    end
  end

  context "#set_parent_stale" do
    test "sets the parent's stale flag if the post has a parent" do
      parent = create(:post)
      create(:post, parent: parent)

      parent.reload

      assert_predicate parent, :stale?
    end
  end

  context "#dup_parent_subscribers" do
    setup do
      @parent = create(:post)
      @subscription = create(:user_subscription, subscribable: @parent)
      @another_subscription = create(:user_subscription, subscribable: @parent)
    end

    test "duplicates subscribers from the parent post" do
      post = create(:post, parent: @parent, member: @parent.member)
      assert_includes post.subscribers, @subscription.user
      assert_includes post.subscribers, @another_subscription.user
      assert_equal @parent.subscribers.sort, post.subscribers.sort
    end
  end

  test "#instrument_created_event" do
    org = create(:organization)
    author_member = create(:organization_membership, organization: org)
    post = create(:post, organization: org, member: author_member)

    assert_equal 1, post.events.created_action.size
    event = post.events.created_action.first!
    assert_equal author_member, event.actor
    assert_enqueued_sidekiq_job(ProcessEventJob, args: [event.id])
  end

  test "#instrument_updated_event" do
    org = create(:organization)
    author_member = create(:organization_membership, organization: org)
    post = create(:post, organization: org, member: author_member)

    post.update!(description_html: "<p>hey!</p>")

    assert_equal 1, post.events.updated_action.size
    event = post.events.updated_action.first!
    assert_equal author_member, event.actor
    assert_enqueued_sidekiq_job(ProcessEventJob, args: [event.id])
  end

  test "#instrument_destroyed_event" do
    org = create(:organization)
    author_member = create(:organization_membership, organization: org)
    post = create(:post, organization: org, member: author_member)

    post.discard

    assert_equal 1, post.events.destroyed_action.size
    event = post.events.destroyed_action.first!
    assert_equal author_member, event.actor
    assert_enqueued_sidekiq_job(ProcessEventJob, args: [event.id])
  end

  context "#new_user_mentions" do
    test "includes new mentions" do
      member = create(:organization_membership)
      post = build(:post, organization: member.organization, description_html: "<p>hey #{MentionsFormatter.format_mention(member)}!</p>")

      assert_equal [member.user], post.new_user_mentions
    end

    test "includes new mentions with escaped underscores in username" do
      member = create(:organization_membership)
      member.user.update!(username: "foo_bar")
      post = build(:post, organization: member.organization, description_html: "<p>hey #{MentionsFormatter.format_mention(member)}!</p>")

      assert_equal [member.user], post.new_user_mentions
    end

    test "does not include application mentions" do
      member = create(:organization_membership)
      application = create(:oauth_application, owner: member.organization)

      html = <<~HTML
        <p>hey #{MentionsFormatter.format_mention(application)} and #{MentionsFormatter.format_mention(member)}</p>
      HTML

      post = build(:post, organization: member.organization, description_html: html)

      assert_equal [member.user], post.new_user_mentions
    end
  end

  context "#new_app_mentions" do
    test "includes new app mentions" do
      application = create(:oauth_application, owner: create(:organization))
      post = build(:post, organization: application.owner, description_html: "<p>hey #{MentionsFormatter.format_mention(application)}</p>")

      assert_equal [application], post.new_app_mentions
    end

    test "does not include discarded apps that are mentioned" do
      member = create(:organization_membership)
      application = create(:oauth_application, owner: member.organization)
      post = build(:post, organization: member.organization, description_html: "<p>hey #{MentionsFormatter.format_mention(application)}</p>")

      application.discard!

      assert_equal [], post.new_app_mentions
    end
  end

  context "#grouped_reactions" do
    test "returns reactions grouped by post id" do
      member = create(:organization_membership, user: create(:user, name: "Albus Dumbledore"))
      post_a = create(:post, organization: member.organization)
      post_b = create(:post, organization: member.organization)
      post_c = create(:post, organization: member.organization)
      create_list(:reaction, 3, subject: post_a)
      create_list(:reaction, 1, subject: post_b)
      member_reaction_1 = create(:reaction, subject: post_b, member: member, content: "👍")
      member_reaction_2 = create(:reaction, :custom_content, subject: post_c, member: member)
      create(:reaction, :discarded, subject: post_b, member: member, content: "👎")

      grouped_reactions = Post.grouped_reactions_async([post_a.id, post_b.id, post_c.id], member).value

      assert_equal(
        [{
          viewer_reaction_id: nil,
          emoji: "🔥",
          custom_content: nil,
          reactions_count: 3,
          tooltip: "Harry Potter, Harry Potter, Harry Potter",
        }],
        grouped_reactions[post_a.id],
      )

      assert_equal(
        [
          {
            viewer_reaction_id: nil,
            emoji: "🔥",
            custom_content: nil,
            reactions_count: 1,
            tooltip: "Harry Potter",
          },
          {
            viewer_reaction_id: member_reaction_1.public_id,
            emoji: "👍",
            custom_content: nil,
            reactions_count: 1,
            tooltip: "Albus Dumbledore",
          },
        ],
        grouped_reactions[post_b.id],
      )

      assert_equal grouped_reactions[post_c.id][0][:custom_content], member_reaction_2.custom_content
    end

    test "falls back to username for tooltip if user has no name" do
      org = create(:organization)
      member_1 = create(:organization_membership, organization: org, user: create(:user, name: "Harry Potter"))
      member_2 = create(:organization_membership, organization: org, user: create(:user, name: nil, username: "hpotter"))
      member_3 = create(:organization_membership, organization: org, user: create(:user, name: nil, username: nil, email: "somethingunique@hogwarts.edu.uk"))
      post = create(:post)
      member_1_reaction = create(:reaction, subject: post, member: member_1)
      create(:reaction, subject: post, member: member_2)
      create(:reaction, subject: post, member: member_3)

      grouped_reactions = Post.grouped_reactions_async([post.id], member_1).value

      assert_equal [{
        viewer_reaction_id: member_1_reaction.public_id,
        emoji: "🔥",
        custom_content: nil,
        reactions_count: 3,
        tooltip: "Harry Potter, hpotter, somethingunique",
      }],
        grouped_reactions[post.id]
    end

    test "returns reactions pluralized" do
      member = create(:organization_membership, user: create(:user, name: "Albus Dumbledore"))
      post = create(:post, organization: member.organization)
      create_list(:reaction, 20, subject: post)

      grouped_reactions = Post.grouped_reactions_async([post.id], member).value

      assert_equal(
        [{
          viewer_reaction_id: nil,
          emoji: "🔥",
          custom_content: nil,
          reactions_count: 20,
          tooltip: "Harry Potter, Harry Potter, Harry Potter, Harry Potter, Harry Potter, Harry Potter, Harry Potter, Harry Potter, Harry Potter, Harry Potter and 10 others",
        }],
        grouped_reactions[post.id],
      )
    end

    test "works when member is nil" do
      post_a = create(:post)
      post_b = create(:post, organization: post_a.organization)
      create_list(:reaction, 3, subject: post_a)
      create_list(:reaction, 1, subject: post_b)
      create(:reaction, subject: post_b, content: "👍")
      create(:reaction, :discarded, subject: post_b, content: "👎")

      grouped_reactions = Post.grouped_reactions_async([post_a.id, post_b.id], nil).value

      assert_equal(
        [
          {
            viewer_reaction_id: nil,
            emoji: "🔥",
            custom_content: nil,
            reactions_count: 1,
            tooltip: "Harry Potter",
          },
          {
            viewer_reaction_id: nil,
            emoji: "👍",
            custom_content: nil,
            reactions_count: 1,
            tooltip: "Harry Potter",
          },
        ],
        grouped_reactions[post_b.id],
      )
    end
  end

  context "#notification_summary" do
    before(:each) do
      @org = create(:organization)
      @notified = create(:organization_membership, organization: @org)
      @author = create(:organization_membership, organization: @org)
      @project = create(:project, organization: @org)
      @post = create(:post, organization: @org, member: @author, project: @project)
      @event = create(:event, subject: @post)
    end

    test "mention" do
      notification = create(:notification, :mention, organization_membership: @notified, event: @event, target: @post)

      summary = @post.notification_summary(notification: notification)

      assert_equal "#{@post.user.display_name} mentioned you in #{@post.title}", summary.text
      assert_equal "#{@post.user.display_name} <#{@post.url}|mentioned you in #{@post.title}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @post.user.display_name, bold: true } },
        { text: { content: " mentioned you on " } },
        { text: { content: @post.title, bold: true } },
      ],
        summary.blocks
    end

    test "parent subscription" do
      notification = create(:notification, :parent_subscription, organization_membership: @notified, event: @event, target: @post)

      summary = @post.notification_summary(notification: notification)

      assert_equal "#{@post.user.display_name} iterated on #{@post.title}", summary.text
      assert_equal "#{@post.user.display_name} <#{@post.url}|iterated on #{@post.title}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @post.user.display_name, bold: true } },
        { text: { content: " iterated on " } },
        { text: { content: @post.title, bold: true } },
      ],
        summary.blocks
    end

    test "project subscription" do
      notification = create(:notification, :project_subscription, organization_membership: @notified, event: @event, target: @post)

      summary = @post.notification_summary(notification: notification)

      assert_equal "#{@post.user.display_name} posted in #{@project.name}", summary.text
      assert_equal "#{@post.user.display_name} <#{@post.url}|posted> in <#{@project.url}|#{@project.name}>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @post.user.display_name, bold: true } },
        { text: { content: " posted in " } },
        { text: { content: @project.name, bold: true } },
      ],
        summary.blocks
    end

    test "no title" do
      @post.update(title: nil)

      notification = create(:notification, :mention, organization_membership: @notified, event: @event, target: @post)

      summary = @post.notification_summary(notification: notification)

      assert_equal "#{@post.user.display_name} mentioned you in their post", summary.text
      assert_equal "#{@post.user.display_name} <#{@post.url}|mentioned you in their post>", summary.slack_mrkdwn
      assert_equal [
        { text: { content: @post.user.display_name, bold: true } },
        { text: { content: " mentioned you on " } },
        { text: { content: "their post" } },
      ],
        summary.blocks
    end
  end

  context "#notification_title" do
    test "returns the post title" do
      post = create(:post, title: "foo bar")
      notification = create(:notification, organization_membership: post.member, target: post)
      assert_equal "foo bar", post.notification_title_plain(notification)
    end

    test "returns a fallback title for the author" do
      post = create(:post, title: "")
      notification = create(:notification, organization_membership: post.member, target: post)
      assert_equal "your post", post.notification_title_plain(notification)
    end

    test "returns a fallback title for the author" do
      post = create(:post, title: "")
      other_member = create(:organization_membership, organization: post.organization)
      notification = create(:notification, organization_membership: other_member, target: post)
      assert_equal "#{post.user.display_name}'s post", post.notification_title_plain(notification)
    end

    test "returns a fallback title for the author" do
      post = create(:post, title: "")
      other_member = create(:organization_membership, organization: post.organization)
      event = create(:event, subject: post, actor: post.member)
      notification = create(:notification, event: event, organization_membership: other_member, target: post)
      assert_equal "their post", post.notification_title_plain(notification)
    end
  end

  context "#notification_body_slack_blocks" do
    before(:each) do
      @post = create(:post, description_html: "<p>foo bar</p>")
      @description_block = { type: "mrkdwn", text: "foo bar" }
      @project_block = { type: "context", elements: [{ type: "mrkdwn", text: "Posted in <#{@post.project.url}|#{@post.project.name}>" }] }
      StyledText.any_instance.expects(:html_to_slack_blocks).returns([@description_block])
    end

    test "includes description block" do
      assert_equal [@description_block, @project_block], @post.notification_body_slack_blocks
    end

    test "includes preview attachment and context when present" do
      attachment_1 = create(:attachment, subject: @post)
      create(:attachment, subject: @post)

      expected = [
        @description_block,
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
        @project_block,
      ]

      assert_equal expected, @post.notification_body_slack_blocks
    end

    test "includes project and tags when present" do
      project = create(:project)
      tag = create(:tag)
      @post.update(project: project, tags: [tag])

      expected = [
        @description_block,
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Posted in <#{project.url}|#{project.name}>",
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "<#{tag.url}|##{tag.name}>",
            },
          ],
        },
      ]

      assert_equal expected, @post.notification_body_slack_blocks
    end
  end

  context "#search" do
    def setup
      Searchkick.enable_callbacks
      @member = create(:organization_membership)
      @user = @member.user
      @org = @member.organization
    end

    def teardown
      Searchkick.disable_callbacks
    end

    test "does not match other orgs" do
      other_org = create(:organization)
      create(:post, :reindex, title: "Foo bar", organization: other_org)
      results = Post.scoped_search(query: "foo", organization: @org)
      assert_equal 0, results.count
    end

    test "does not match discarded posts" do
      create(:post, :reindex, :discarded, title: "Foo bar", organization: @org)
      results = Post.scoped_search(query: "foo", organization: @org)
      assert_equal 0, results.count
    end

    test "search title" do
      post = create(:post, :reindex, title: "Foo bar", organization: @org)
      results = Post.scoped_search(query: "foo", organization: @org)
      posts = Pundit.policy_scope(@user, Post.where(id: results.pluck(:id)))
      assert_equal 1, results.count
      assert_equal post.id, posts.first.id
    end

    test "search description" do
      post = create(:post, :reindex, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>", organization: @org)
      results = Post.scoped_search(query: "dog", organization: @org)
      posts = Pundit.policy_scope(@user, Post.where(id: results.pluck(:id)))
      assert_equal 1, results.count
      assert_equal post.id, posts.first.id
    end

    test "search username prefix" do
      other_member = create(:organization_membership, organization: @org, user: create(:user, username: "foo_bar"))
      post = create(:post, :reindex, title: "title", description_html: "<p>description</p>", member: other_member, organization: @org)
      results = Post.scoped_search(query: "foo", organization: @org)
      posts = Pundit.policy_scope(@user, Post.where(id: results.pluck(:id)))
      assert_equal 1, results.count
      assert_equal post.id, posts.first.id
    end

    test "search user name" do
      other_member = create(:organization_membership, organization: @org, user: create(:user, name: "Foo bar"))
      post = create(:post, :reindex, title: "title", description_html: "<p>description</p>", member: other_member, organization: @org)
      results = Post.scoped_search(query: "bar", organization: @org)
      posts = Pundit.policy_scope(@user, Post.where(id: results.pluck(:id)))
      assert_equal 1, results.count
      assert_equal post.id, posts.first.id
    end

    test "search project" do
      project = create(:project, name: "Foo bar", organization: @org)
      post = create(:post, :reindex, title: "title", description_html: "<p>description</p>", project: project, organization: @org)
      results = Post.scoped_search(query: "foo", organization: @org)
      posts = Pundit.policy_scope(@user, Post.where(id: results.pluck(:id)))
      assert_equal 1, results.count
      assert_equal post.id, posts.first.id
    end

    test "does not return posts in private projects without permissions" do
      project = create(:project, private: true, name: "Foo bar", organization: @org)
      create(:post, :reindex, title: "title", description_html: "<p>description</p>", project: project, organization: @org)
      results = Post.scoped_search(query: "foo", organization: @org)
      posts = Pundit.policy_scope(@user, Post.where(id: results.pluck(:id)))
      assert_equal 1, results.count
      assert_equal 0, posts.count
    end

    test "includes posts in private projects with permissions" do
      project = create(:project, private: true, name: "Foo bar", organization: @org)
      create(:project_membership, organization_membership: @member, project: project)
      post = create(:post, :reindex, title: "title", description_html: "<p>description</p>", project: project, organization: @org)
      results = Post.scoped_search(query: "foo", organization: @org)
      posts = Pundit.policy_scope(@user, Post.where(id: results.pluck(:id)))
      assert_equal 1, results.count
      assert_equal post.id, posts.first.id
    end

    test "search comments" do
      post = create(:post, :reindex, title: nil, description_html: "<p>cat</p> <p>dog</p>", organization: @org)
      create(:comment, body_html: "<p>needle</p>", subject: post, member: @member)
      post.reload.reindex(refresh: true)
      results = Post.scoped_search(query: "needle", organization: @org)
      posts = Pundit.policy_scope(@user, Post.where(id: results.pluck(:id)))
      assert_equal 1, posts.count
      assert_equal post.id, posts.first.id
    end

    test "search ranks by recency" do
      description_html = <<~HTML.squish
        <p>It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood; who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming; but who does actually strive to do the deeds; who knows great enthusiasms, the great devotions; who spends himself in a worthy cause; who at the best knows in the end the triumph of high achievement, and who at the worst, if he fails, at least fails while daring greatly, so that his place shall never be with those cold and timid souls who neither know victory nor defeat.</p>
      HTML
      post1 = create(:post, :reindex, title: nil, description_html: description_html, organization: @org, created_at: 1.month.ago)
      post2 = create(:post, :reindex, title: nil, description_html: description_html, organization: @org, created_at: 1.day.ago)
      post3 = create(:post, :reindex, title: nil, description_html: description_html, organization: @org, created_at: 4.days.ago)
      post4 = create(:post, :reindex, title: nil, description_html: description_html, organization: @org, created_at: 2.weeks.ago)
      results = Post.scoped_search(query: "critic triumph blood", organization: @org)
      ids = results.pluck(:id)
      assert_equal 4, ids.count
      assert_equal [post2, post3, post4, post1].pluck(:id), ids
    end

    test "search ranks by more hits in older posts" do
      post1 = create(
        :post,
        :reindex,
        title: nil,
        description_html: "<p>It is not the critic who counts; not the man who points out how the strong man stumbles.</p>",
        organization: @org,
        created_at: 2.days.ago,
      )
      post2 = create(
        :post,
        :reindex,
        title: nil,
        description_html: "<p>Or where the doer of deeds could have done them better.</p>",
        organization: @org,
        created_at: 2.weeks.ago,
      )
      post3 = create(
        :post,
        :reindex,
        title: nil,
        description_html: "<p>The credit belongs to the man who is actually in the arena.</p>",
        organization: @org,
        created_at: 2.months.ago,
      )
      create(
        :post,
        :reindex,
        title: nil,
        description_html: "<p>Whose face is marred by dust and sweat and blood.</p>",
        organization: @org,
        created_at: 4.days.ago,
      )
      results = Post.scoped_search(query: "man in the arena", organization: @org)
      ids = results.pluck(:id)
      assert_equal 3, ids.count
      assert_equal [post3, post1, post2].pluck(:id), ids
    end

    test "search ranks exact phrase" do
      create(
        :post,
        :reindex,
        title: nil,
        description_html: "<p>It is not the critic who points</p>",
        organization: @org,
        created_at: 2.days.ago,
      )
      exact = create(
        :post,
        :reindex,
        title: nil,
        description_html: "<p>It is not the critic who counts; not the man who points out how the strong man stumbles.</p>",
        organization: @org,
        created_at: 2.days.ago,
      )
      create(
        :post,
        :reindex,
        title: nil,
        description_html: "<p>Man, It is not the point who is the critic</p>",
        organization: @org,
        created_at: 2.days.ago,
      )
      create(
        :post,
        :reindex,
        title: nil,
        description_html: "<p>I'm the man</p>",
        organization: @org,
        created_at: 2.days.ago,
      )
      results = Post.scoped_search(query: "man who points", organization: @org)
      ids = results.pluck(:id)
      assert_equal 4, ids.count
      assert_equal exact.id, ids.first
    end

    test "works when there are no posts" do
      Post.destroy_all
      Post.reindex

      results = Post.scoped_search(query: "foo", organization: @org)

      assert_equal 0, results.count
    end
  end

  context "#update_project_contributors_count" do
    before(:each) do
      @project = create(:project)
      @org = @project.organization
    end

    test "enqueues a job to update the project contributors count on creation" do
      create(:post, project: @project, organization: @org)

      assert_enqueued_sidekiq_job(UpdateProjectContributorsCountJob, args: [@project.id])
    end

    test "enqueues a job to update the project contributors count on destruction" do
      post = create(:post, project: @project, organization: @org)
      Sidekiq::Queues.clear_all

      post.destroy!

      assert_enqueued_sidekiq_job(UpdateProjectContributorsCountJob, args: [@project.id])
    end

    test "enqueues a job to update new and old project contributors counts on project change" do
      new_project = create(:project, organization: @org)
      post = create(:post, project: @project, organization: @org)
      Sidekiq::Queues.clear_all

      post.update!(project: new_project)

      assert_enqueued_sidekiq_job(UpdateProjectContributorsCountJob, args: [@project.id])
      assert_enqueued_sidekiq_job(UpdateProjectContributorsCountJob, args: [new_project.id])
    end

    test "no-ops when update doesn't change project" do
      post = create(:post, project: @project, organization: @org)
      Sidekiq::Queues.clear_all

      post.update!(title: "My super cool title")

      refute_enqueued_sidekiq_job(UpdateProjectContributorsCountJob)
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
      post = create(:post, description_html: html)
      post.update_task(index: 0, checked: true)

      doc = Nokogiri::HTML.fragment(post.description_html)

      inputs = doc.css("input")
      lis = doc.css("li")

      assert_equal 2, inputs.count
      assert_equal 2, lis.count

      assert_equal "true", lis[0].attr("data-checked")
      assert_equal "true", lis[1].attr("data-checked")

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
      post = create(:post, description_html: html)
      post.update_task(index: 1, checked: false)

      doc = Nokogiri::HTML.fragment(post.description_html)

      inputs = doc.css("input")
      lis = doc.css("li")

      assert_equal 2, inputs.count
      assert_equal 2, lis.count

      assert_equal "false", lis[0].attr("data-checked")
      assert_equal "false", lis[1].attr("data-checked")

      assert_not_equal "checked", inputs[0].attr("checked")
      assert_not_equal "checked", inputs[1].attr("checked")
    end

    test "does not error when task index is OOB" do
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

      assert_nothing_raised do
        post = create(:post, description_html: html)
        post.update_task(index: 10, checked: false)
        post.update_task(index: -1, checked: false)
      end
    end
  end

  context "#prerenders" do
    test "filters discarded members from preview comments" do
      post = create(:post)
      comments = create_list(:comment, 2, subject: post)
      comment = create(:comment, subject: post)
      comment.member.discard

      result = Post.preview_commenters_async([post.id]).value[post.id]

      assert_equal comments.map { |c| c.member.id }.sort, result.map(&:id).sort
    end

    test "filters discarded comments from preview comments" do
      post = create(:post)
      comments = create_list(:comment, 2, subject: post)
      comment = create(:comment, subject: post)
      comment.discard

      result = Post.preview_commenters_async([post.id]).value[post.id]

      assert_equal comments.map { |c| c.member.id }.sort, result.map(&:id).sort
    end

    test "filters resolved comments from preview comments" do
      post = create(:post)
      comments = create_list(:comment, 2, subject: post)
      comment = create(:comment, subject: post)
      comment.resolve!(actor: post.member)

      result = Post.preview_commenters_async([post.id]).value[post.id]

      assert_equal comments.map { |c| c.member.id }.sort, result.map(&:id).sort
    end

    test "viewer has commented" do
      org = create(:organization)
      posts = create_list(:post, 2, organization: org)
      comment = create(:comment, subject: posts[0])

      result = Post.viewer_has_commented_async(posts.map(&:id), comment.member).value
      assert result[posts[0].id]
      assert_not result[posts[1].id]
    end

    test "viewer has subscribed" do
      org = create(:organization)
      posts = create_list(:post, 2, organization: org)
      member = create(:organization_membership, organization: org)
      create(:user_subscription, subscribable: posts[0], user: member.user)

      result = Post.viewer_has_subscribed_async(posts.map(&:id), member).value
      assert result[posts[0].id]
      assert_not result[posts[1].id]
    end

    test "viewer has viewed" do
      org = create(:organization)
      posts = create_list(:post, 3, organization: org)
      member = create(:organization_membership, organization: org)
      create(:post_view, :read, post: posts[0], member: member)
      create(:post_view, post: posts[1], member: member)

      # posts are considered "viewed" by the viewer no matter the value of read_at
      result = Post.viewer_has_viewed_async(posts.map(&:id), member).value
      assert result[posts[0].id]
      assert result[posts[1].id]
      assert_not result[posts[2].id]
    end

    test "viewer voted" do
      org = create(:organization)
      posts = create_list(:post, 2, organization: org)
      poll1 = create(:poll, :with_options, post: posts[0])
      poll2 = create(:poll, :with_options, post: posts[1])
      member = create(:organization_membership, organization: org)
      create(:poll_vote, poll_option: poll1.options[0], member: member)

      result = Post.viewer_voted_option_ids_by_poll_id_async(posts.map(&:id), member).value
      assert_equal [poll1.options[0].id], result[poll1.id]
      assert_nil result[poll2.id]
    end

    test "unseen comment counts" do
      org = create(:organization)
      posts = create_list(:post, 3, organization: org)
      member = create(:organization_membership, organization: org)
      create(:comment, subject: posts[0])
      create(:post_view, :read, post: posts[0], member: member)
      create(:comment, subject: posts[0])
      create(:comment, subject: posts[1])

      result = Post.unseen_comment_counts_async(posts.map(&:id), member).value
      assert_equal 1, result[posts[0].id][:count]
      assert_equal 0, result[posts[1].id][:count]
      assert_nil result[posts[2].id]
    end

    test "viewer feedback request status" do
      none = create(:post)
      member = create(:organization_membership, organization: none.organization)
      open = create(:post, :feedback_requested, organization: none.organization)
      viewer_requested = create(:post, :feedback_requested, organization: none.organization)
      create(:post_feedback_request, post: viewer_requested, member: member)
      viewer_responded = create(:post, :feedback_requested, organization: none.organization)
      create(:post_feedback_request, post: viewer_responded, member: member, has_replied: true)

      result = {}
      assert_query_count(1) do
        result = Post.viewer_feedback_status_async([none, open, viewer_requested, viewer_responded], member).value
      end

      assert_equal :none, result[none.id]
      assert_equal :open, result[open.id]
      assert_equal :viewer_requested, result[viewer_requested.id]
      assert_equal :none, result[viewer_responded.id]
    end

    test "fetches the latest comment" do
      post = create(:post)
      create_list(:comment, 2, subject: post)
      latest_comment = create(:comment, subject: post)

      result = Post.latest_comment_async([post], latest_comment.member).value[post.id]

      assert_equal latest_comment.id, result.id
    end

    test "returns pin public_id" do
      post = create(:post, project: create(:project))
      pin = create(:project_pin, subject: post, project: post.project)

      result = Post.pin_public_ids_async([post.id], post.member).value[post.id]

      assert_equal pin.public_id, result
    end

    test "does not return pin public_id when discarded" do
      post = create(:post, project: create(:project))
      pin = create(:project_pin, subject: post, project: post.project)
      pin.discard

      result = Post.pin_public_ids_async([post.id], post.member).value[post.id]

      assert_nil result
    end
  end

  context "#destroy!" do
    test "enqueues DeleteSlackMessageJob for Slack links" do
      slack_link = create(:post_link, :slack)
      post = slack_link.post

      post.destroy!

      assert_nil Post.find_by(id: post.id)
      assert_enqueued_sidekiq_job(DeleteSlackMessageJob, args: [post.organization.id, slack_link.slack_channel_id, slack_link.slack_message_ts])
    end

    test "does not enqueue DeleteSlackMessageJob for Slack links when organization already destroyed" do
      slack_link = create(:post_link, :slack)
      post = slack_link.post
      post.organization.destroy!

      post.reload.destroy!

      assert_nil Post.find_by(id: post.id)
      refute_enqueued_sidekiq_job(DeleteSlackMessageJob)
    end
  end

  context "#title_from_description" do
    test "matches header tags" do
      assert_equal "Foo Bar", create(:post, description_html: "<h1>Foo Bar</h1><p>Cat dog</p>").title_from_description
      assert_equal "Foo Bar", create(:post, description_html: "<h2>Foo Bar</h2><p>Cat dog</p>").title_from_description
      assert_equal "Foo Bar", create(:post, description_html: "<h3>Foo Bar</h3><p>Cat dog</p>").title_from_description
      assert_equal "Foo Bar", create(:post, description_html: "<h4>Foo Bar</h4><p>Cat dog</p>").title_from_description
      assert_equal "Foo Bar", create(:post, description_html: "<h5>Foo Bar</h5><p>Cat dog</p>").title_from_description
      assert_equal "Foo Bar", create(:post, description_html: "<h6>Foo Bar</h6><p>Cat dog</p>").title_from_description
    end

    test "matches bold tags" do
      assert_equal "Foo Bar", create(:post, description_html: "<p><strong>Foo Bar</strong></p><p>Cat dog</p>").title_from_description
      assert_equal "Foo Bar", create(:post, description_html: "<p><b>Foo Bar</b></p><p>Cat dog</p>").title_from_description
    end

    test "does not match paragraphs" do
      assert_nil create(:post, description_html: "<p><strong>Foo</strong> Bar</p><p>Cat dog</p>").title_from_description
      assert_nil create(:post, description_html: "<p>Foo <b>Bar</b></p><p>Cat dog</p>").title_from_description
      assert_nil create(:post, description_html: "<p>Foo Bar</p><p>Cat dog</p>").title_from_description
      assert_nil create(:post, description_html: "<ol><li>Foo Bar</li></ol><p>Cat dog</p>").title_from_description
      assert_nil create(:post, description_html: "<p>Cat dog</p><h1>Foo Bar</h1>").title_from_description
    end
  end

  context "#title_from_description" do
    test "matches header tags" do
      assert create(:post, title: nil, description_html: "<h1>Foo Bar</h1><p>Cat dog</p>").title_from_description?
      assert create(:post, title: "", description_html: "<h1>Foo Bar</h1><p>Cat dog</p>").title_from_description?
      assert create(:post, title: nil, description_html: "<h3>Foo Bar</h3><p>Cat dog</p>").title_from_description?
      assert create(:post, title: nil, description_html: "<p><b>Foo Bar</b></p><p>Cat dog</p>").title_from_description?
      assert create(:post, title: nil, description_html: "<p><strong>Foo Bar</strong></p><p>Cat dog</p>").title_from_description?

      assert_not create(:post, title: "Foo bar", description_html: "<p><strong>Foo Bar</strong></p><p>Cat dog</p>").title_from_description?
      assert_not create(:post, title: "Foo bar", description_html: "<h1>Foo Bar</h1><p>Cat dog</p>").title_from_description?
      assert_not create(:post, title: "Foo bar", description_html: "<p>Cat dog</p>").title_from_description?
      assert_not create(:post, title: "Foo bar", description_html: "").title_from_description?
    end
  end

  context "#llm_post_and_comments_member_display_name_map" do
    test "supports nil users" do
      post = create(:post, :from_integration)
      comment = create(:comment, :from_oauth_application, subject: post)
      create(:comment, :from_integration, subject: post, parent: comment)
      assert_empty post.llm_post_and_comments_member_display_name_map.compact
    end
  end

  context "#extracted_resource_mentions" do
    test "policy scopes post results" do
      same_org_post = create(:post)
      other_org_post = create(:post)

      organization = same_org_post.organization
      member = create(:organization_membership, organization: organization)

      same_org_note = create(:note, member: create(:organization_membership, organization: organization))
      open_project = create(:project, organization: organization)
      same_org_note.add_to_project!(project: open_project)

      other_org_note = create(:note)

      same_org_call = create(:call, room: create(:call_room, organization: organization))
      create(:call_peer, call: same_org_call, organization_membership: member)

      other_org_call = create(:call)

      body = <<~HTML.strip
        <resource-mention href="https://app.campsite.com/campsite/posts/#{same_org_post.public_id}"></resource-mention>
        <resource-mention href="https://app.campsite.com/campsite/posts/#{other_org_post.public_id}"></resource-mention>
        <resource-mention href="https://app.campsite.com/campsite/notes/#{same_org_note.public_id}"></resource-mention>
        <resource-mention href="https://app.campsite.com/campsite/notes/#{other_org_note.public_id}"></resource-mention>
        <resource-mention href="https://app.campsite.com/campsite/calls/#{same_org_call.public_id}"></resource-mention>
        <resource-mention href="https://app.campsite.com/campsite/calls/#{other_org_call.public_id}"></resource-mention>
      HTML

      post = create(:post, description_html: body, organization: organization)
      result = Post.extracted_resource_mentions_async(subjects: [post], member: member).value
      result = result[post.id]

      assert_equal [same_org_post], result.serializer_array.pluck(:post).compact
      assert_equal [same_org_call], result.serializer_array.pluck(:call).compact
      assert_equal [same_org_note], result.serializer_array.pluck(:note).compact
    end

    test "does not query when no mentions" do
      body = <<~HTML.strip
        Foo bar <strong>Baz</strong>
      HTML

      post = create(:post, description_html: body)
      member = create(:organization_membership, organization: post.organization)

      assert_query_count 0 do
        Post.extracted_resource_mentions_async(subjects: [post], member: member).value
      end
    end

    test "only queries for the mentioned types" do
      same_org_post = create(:post)
      organization = same_org_post.organization

      body = <<~HTML.strip
        <resource-mention href="https://app.campsite.com/campsite/posts/#{same_org_post.public_id}"></resource-mention>
      HTML

      post = create(:post, description_html: body, organization: organization)
      member = create(:organization_membership, organization: organization)

      assert_query_count 1 do
        Post.extracted_resource_mentions_async(subjects: [post], member: member).value
      end
    end
  end

  context "#export_json" do
    test "exports metadata" do
      post = create(:post, description_html: "<p>My comment</p>")
      create_list(:comment, 3, subject: post)
      export = post.export_json
      assert_equal 3, export[:comments].count
      assert_equal post.public_id, export[:id]
      assert_equal "My comment", export[:description]
    end

    test "handles integration posts" do
      post = create(:post, :from_integration)
      export = post.export_json
      assert_equal post.public_id, export[:id]
      assert_equal "integration", export[:author][:type]
    end

    test "handles oauth app posts" do
      post = create(:post, :from_oauth_application)
      export = post.export_json
      assert_equal post.public_id, export[:id]
      assert_equal "oauth_application", export[:author][:type]
    end
  end
end
