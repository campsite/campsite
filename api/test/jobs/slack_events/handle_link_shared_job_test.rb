# frozen_string_literal: true

require "test_helper"

module SlackEvents
  class HandleLinkSharedJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("slack/link_shared_event_payload.json").read)
      @organization = create(:organization)
      @slack_team_id = create(:slack_team_id, organization: @organization, value: @params["team_id"])
    end

    context "perform" do
      test "unfurls a post link when the organization with the Slack team_id owns the post" do
        post = create(:post, organization: @organization, description_html: "<p>My post</p>")
        @params["event"]["links"] = [{ url: "http://app.campsite.test/org/posts/#{post.public_id}" }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl)
        StyledText.any_instance.expects(:html_to_slack_blocks).returns([{ type: "mrkdwn", text: "My post" }])

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "does not unfurl a post link when another team owns the post" do
        post = create(:post, organization: create(:organization, name: "other org"))
        @params["event"]["links"] = [{ url: "http://app.campsite.test/org/posts/#{post.public_id}" }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).never
        StyledText.any_instance.expects(:html_to_slack_blocks).never

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "does not unfurl a post link for a post in a private project" do
        project = create(:project, organization: @organization, private: true)
        post = create(:post, organization: @organization, project: project)
        @params["event"]["links"] = [{ url: "http://app.campsite.test/org/posts/#{post.public_id}" }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).never
        StyledText.any_instance.expects(:html_to_slack_blocks).never

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "unfurls a comment link when the organization with the Slack team_id owns the post" do
        post = create(:post, organization: @organization)
        comment = create(:comment, subject: post, body_html: "<p>My comment</p>")
        @params["event"]["links"] = [{ url: comment.url }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl)
        StyledText.any_instance.expects(:html_to_slack_blocks).with(comment.body_html).returns([{ type: "mrkdwn", text: "My comment" }])

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "does not unfurl a comment link when another team owns the comment" do
        post = create(:post, organization: create(:organization, name: "other org"))
        comment = create(:comment, subject: post)
        @params["event"]["links"] = [{ url: comment.url }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).never
        StyledText.any_instance.expects(:html_to_slack_blocks).never

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "does not unfurl a comment link for a comment in a private project" do
        project = create(:project, organization: @organization, private: true)
        post = create(:post, organization: @organization, project: project)
        comment = create(:comment, subject: post)
        @params["event"]["links"] = [{ url: comment.url }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).never
        StyledText.any_instance.expects(:html_to_slack_blocks).never

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "unfurls a project link" do
        project = create(:project, organization: @organization)
        @params["event"]["links"] = [{ url: project.url }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).with({
          channel: @params["event"]["channel"],
          ts: @params["event"]["message_ts"],
          unfurls: {
            project.url => {
              blocks: [
                {
                  type: "section",
                  text: {
                    "type": "mrkdwn",
                    "text": "*<#{project.url}|#{project.name}>*",
                  },
                },
              ],
              color: Campsite::BRAND_ORANGE_HEX_CODE,
            },
          }.to_json,
        })

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "does not unfurl a project link if another team owns the project" do
        project = create(:project)
        @params["event"]["links"] = [{ url: project.url }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).never

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "does not unfurl a private project link" do
        project = create(:project, organization: @organization, private: true)
        @params["event"]["links"] = [{ url: project.url }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).never

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "does not attempt to unfurl if no organization with matching Slack team_id found" do
        @slack_team_id.destroy!

        Slack::Web::Client.any_instance.expects(:chat_unfurl).never
        StyledText.any_instance.expects(:html_to_slack_blocks).never

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "no-ops when orignal message has been deleted" do
        post = create(:post, organization: @organization, description_html: "<p>My post</p>")
        @params["event"]["links"] = [{ url: "http://app.campsite.test/org/posts/#{post.public_id}" }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).raises(Slack::Web::Api::Errors::CannotFindMessage.new("cannot_find_message"))
        StyledText.any_instance.expects(:html_to_slack_blocks).returns([{ type: "mrkdwn", text: "My post" }])

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "no-ops when message no longer contains link" do
        post = create(:post, organization: @organization, description_html: "<p>My post</p>")
        @params["event"]["links"] = [{ url: "http://app.campsite.test/org/posts/#{post.public_id}" }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).raises(Slack::Web::Api::Errors::CannotUnfurlMessage.new("cannot_unfurl_message"))
        StyledText.any_instance.expects(:html_to_slack_blocks).returns([{ type: "mrkdwn", text: "My post" }])

        HandleLinkSharedJob.new.perform(@params.to_json)
      end

      test "no-ops for an invalid link" do
        post = create(:post, organization: @organization)
        @params["event"]["links"] = [{ url: "http://app.campsite.test/org/posts/#{post.public_id}\\r\\n" }]

        Slack::Web::Client.any_instance.expects(:chat_unfurl).never

        HandleLinkSharedJob.new.perform(@params.to_json)
      end
    end
  end
end
