# frozen_string_literal: true

require "test_helper"

class SlackConnectedConfirmationJobTest < ActiveJob::TestCase
  context "#perform" do
    test "sends Slack message to an admin" do
      admin = create(:organization_membership)
      integration_organization_membership = create(:integration_organization_membership, organization_membership: admin)
      organization = admin.organization

      Slack::Web::Client.any_instance.expects(:chat_postMessage).with({
        channel: admin.slack_user_id,
        blocks: [
          SlackBlockKit.mrkdwn_section_block(text: "🏕️ You've successfully connected Campsite to Slack to receive notifications."),
          SlackBlockKit.mrkdwn_section_block(text: "You can manage these notifications in your <#{Campsite.user_settings_url}|account settings>."),
          SlackBlockKit.mrkdwn_section_block(text: "Your organization is also ready to broadcast new posts to Slack channels — you can configure broadcasts in your <#{organization.settings_url}|organization settings>."),
        ],
      })

      SlackConnectedConfirmationJob.new.perform(integration_organization_membership.id)

      assert_predicate admin.reload, :welcomed_to_slack?
    end

    test "sends Slack message to a member" do
      member = create(:organization_membership, :member)
      integration_organization_membership = create(:integration_organization_membership, organization_membership: member)

      Slack::Web::Client.any_instance.expects(:chat_postMessage).with({
        channel: member.slack_user_id,
        blocks: [
          SlackBlockKit.mrkdwn_section_block(text: "🏕️ You've successfully connected Campsite to Slack to receive notifications."),
          SlackBlockKit.mrkdwn_section_block(text: "You can manage these notifications in your <#{Campsite.user_settings_url}|account settings>."),
        ],
      })

      SlackConnectedConfirmationJob.new.perform(integration_organization_membership.id)
    end
  end
end
