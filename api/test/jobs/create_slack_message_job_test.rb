# frozen_string_literal: true

require "test_helper"

class CreateSlackMessageJobTest < ActiveJob::TestCase
  context "perform" do
    setup do
      @organization = create(:organization)
      @project = create(:project, organization: @organization, slack_channel_id: "channel-id")
    end

    test "does not create a slack message if the post is not slackable" do
      post = create(:post)
      Post.any_instance.stubs(:slackable?).returns(false)
      Post.any_instance.expects(:create_slack_message!).never

      CreateSlackMessageJob.new.perform(post.id)
    end

    test "creates a slack message if the post is slackable" do
      post = create(:post, organization: @organization, project: @project)
      Post.any_instance.stubs(:slackable?).returns(true)
      Post.any_instance.expects(:create_slack_message!).with(@project.slack_channel_id)

      CreateSlackMessageJob.new.perform(post.id)
    end

    test "joins the slack channel if the campsite bot is not a channel member" do
      post = create(:post, organization: @organization, project: @project)
      Post.any_instance.expects(:slackable?).returns(true)
      Slack::Web::Client.any_instance.expects(:chat_postMessage)
        .raises(Slack::Web::Api::Errors::NotInChannel.new("error"))
        .then
        .returns({ "ts" => "123" })
        .twice
      Slack::Web::Client.any_instance.expects(:chat_getPermalink).returns({ "permalink" => "https://example.com" })
      StyledText.any_instance.expects(:html_to_slack_blocks).twice.returns([])
      Slack::Web::Client.any_instance.stubs(:conversations_join).with(channel: @project.slack_channel_id)

      CreateSlackMessageJob.new.perform(post.id)
    end

    test "doesn't send message to organization Slack channel" do
      org = create(:organization, slack_channel_id: "channel-id")
      project = create(:project, organization: org)
      post = create(:post, organization: org, project: project)
      Post.any_instance.stubs(:slackable?).returns(true)
      Post.any_instance.expects(:create_slack_message!).never

      CreateSlackMessageJob.new.perform(post.id)
    end

    test "doesn't send message to organization Slack channel if project is private" do
      org = create(:organization, slack_channel_id: "channel-id")
      project = create(:project, organization: org, private: true)
      post = create(:post, organization: org, project: project)
      Post.any_instance.stubs(:slackable?).returns(true)
      Post.any_instance.expects(:create_slack_message!).never

      CreateSlackMessageJob.new.perform(post.id)
    end
  end
end
