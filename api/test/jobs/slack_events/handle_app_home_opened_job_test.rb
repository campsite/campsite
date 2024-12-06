# frozen_string_literal: true

require "test_helper"

module SlackEvents
  class HandleAppHomeOpenedJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("slack/app_home_opened_event_payload.json").read)
      @integration = create(:integration, :slack)
      @org = @integration.owner
      @slack_team_id = create(:slack_team_id, integration: @integration, value: @params["team_id"])
      integration_organization_membership = create(:integration_organization_membership, integration: @integration)
      integration_organization_membership.data.create!(name: IntegrationOrganizationMembershipData::INTEGRATION_USER_ID, value: @params["event"]["user"])
      @member = integration_organization_membership.organization_membership
    end

    context "perform" do
      test "sends a welcome message" do
        assert_not_predicate @member, :welcomed_to_slack?

        Slack::Web::Client.any_instance.expects(:chat_postMessage).with({
          blocks: [{
            type: "section",
            text: { type: "mrkdwn", text: "🏕️ Your organization’s Campsite is connected to Slack! You can manage notifications in your <http://app.campsite.test:3000/me/settings|account settings>." },
          }],
          channel: @params["event"]["channel"],
        })

        HandleAppHomeOpenedJob.new.perform(@params.to_json)

        assert_predicate @member.reload, :welcomed_to_slack?
      end

      test "sends a welcome message and creates OrganizationMembershipIntegration record if no member with Slack user ID exists" do
        @member.destroy!

        Slack::Web::Client.any_instance.expects(:chat_postMessage).with({
          blocks: [{
            type: "section",
            text: { type: "mrkdwn", text: "🏕️ Your organization’s Campsite is connected to Slack! You can manage notifications in your <http://app.campsite.test:3000/me/settings|account settings>." },
          }],
          channel: @params["event"]["channel"],
        })

        HandleAppHomeOpenedJob.new.perform(@params.to_json)

        assert_predicate @org.slack_integration.data.find_by(name: IntegrationData::UNRECOGNIZED_USER_ID, value: @params["event"]["user"]), :present?
      end

      test "does not send a welcome message if member already welcomed" do
        @member.welcomed_to_slack!

        Slack::Web::Client.any_instance.expects(:chat_postMessage).never

        HandleAppHomeOpenedJob.new.perform(@params.to_json)
      end

      test "does not send a welcome message if member already has notifications" do
        create(:notification, organization_membership: @member, slack_message_ts: "123")

        Slack::Web::Client.any_instance.expects(:chat_postMessage).never

        HandleAppHomeOpenedJob.new.perform(@params.to_json)
      end

      test "does not send a welcome message if unrecognized user already welcomed" do
        @member.destroy!
        @org.slack_integration.data.create!(name: IntegrationData::UNRECOGNIZED_USER_ID, value: @params["event"]["user"])

        Slack::Web::Client.any_instance.expects(:chat_postMessage).never

        HandleAppHomeOpenedJob.new.perform(@params.to_json)
      end
    end
  end
end
