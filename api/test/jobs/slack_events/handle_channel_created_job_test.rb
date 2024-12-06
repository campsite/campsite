# frozen_string_literal: true

require "test_helper"
require "test_helpers/slack_test_helper"

module SlackEvents
  class HandleChannelCreatedJobTest < ActiveJob::TestCase
    include SlackTestHelper

    before(:each) do
      @params = JSON.parse(file_fixture("slack/channel_created_event_payload.json").read)
      @organization = create(:organization)
      @slack_team_id = create(:slack_team_id, organization: @organization, value: @params["team_id"])
      stub_conversations_info(id: @params["event"]["channel"]["id"], name: @params["event"]["channel"]["name"])
    end

    context "perform" do
      test "creates a new public IntegrationChannel" do
        assert_difference -> { @organization.slack_channels.count }, 1 do
          HandleChannelCreatedJob.new.perform(@params.to_json)
        end

        channel = @organization.slack_channels.find_by!(provider_channel_id: @params["event"]["channel"]["id"])
        assert_equal @params["event"]["channel"]["name"], channel.name
        assert_not_predicate channel, :private?
      end

      test "creates a new private IntegrationChannel" do
        stub_conversations_info(id: @params["event"]["channel"]["id"], name: @params["event"]["channel"]["name"], is_private: true)

        assert_difference -> { @organization.slack_channels.count }, 1 do
          HandleChannelCreatedJob.new.perform(@params.to_json)
        end

        channel = @organization.slack_channels.find_by!(provider_channel_id: @params["event"]["channel"]["id"])
        assert_equal @params["event"]["channel"]["name"], channel.name
        assert_predicate channel, :private?
      end

      test "does not create a new IntegrationChannel when no organization with the Slack team_id exists" do
        @organization.destroy!

        assert_difference -> { IntegrationChannel.count }, 0 do
          HandleChannelCreatedJob.new.perform(@params.to_json)
        end
      end

      test "updates a IntegrationChannel when one with the channel ID already exists" do
        channel = create(:integration_channel, integration: @organization.slack_integration, provider_channel_id: @params["event"]["channel"]["id"], private: true)

        assert_difference -> { IntegrationChannel.count }, 0 do
          HandleChannelCreatedJob.new.perform(@params.to_json)
        end

        assert_not_predicate channel.reload, :private?
      end

      test "no-ops if channel no longer exists" do
        Slack::Web::Client.any_instance.stubs(:conversations_info).raises(Slack::Web::Api::Errors::ChannelNotFound.new("channel_not_found"))

        assert_difference -> { IntegrationChannel.count }, 0 do
          HandleChannelCreatedJob.new.perform(@params.to_json)
        end
      end

      test "re-enqueues for later if Slack returns a TooManyRequestsError" do
        Sidekiq::Testing.server_middleware do |chain|
          chain.add(SidekiqExceptionHandlingMiddleware)
        end

        retry_after = 30
        Slack::Web::Client.any_instance.stubs(:conversations_info)
          .raises(Slack::Web::Api::Errors::TooManyRequestsError.new(OpenStruct.new(headers: { "retry-after" => retry_after }))) # rubocop:disable Style/OpenStructUse
        HandleChannelCreatedJob.expects(:perform_in).with(retry_after.seconds, @params.to_json)

        Sidekiq::Testing.inline! do
          HandleChannelCreatedJob.perform_async(@params.to_json)
        end
      end
    end
  end
end
