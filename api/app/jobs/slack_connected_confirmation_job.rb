# frozen_string_literal: true

class SlackConnectedConfirmationJob < BaseJob
  sidekiq_options queue: "background"

  delegate :mrkdwn_section_block, :mrkdwn_link, to: SlackBlockKit

  def perform(integration_organization_membership_id)
    integration_organization_membership = IntegrationOrganizationMembership.find(integration_organization_membership_id)
    integration = integration_organization_membership.integration
    organization_membership = integration_organization_membership.organization_membership
    organization = organization_membership.organization

    blocks = [
      mrkdwn_section_block(text: "🏕️ You've successfully connected Campsite to Slack to receive notifications."),
      mrkdwn_section_block(text: "You can manage these notifications in your #{mrkdwn_link(text: "account settings", url: Campsite.user_settings_url)}."),
    ]

    if organization_membership.admin?
      blocks += [mrkdwn_section_block(text: "Your organization is also ready to broadcast new posts to Slack channels — you can configure broadcasts in your #{mrkdwn_link(text: "organization settings", url: organization.settings_url)}.")]
    end

    Slack::Web::Client.new(token: integration.token).chat_postMessage({ blocks: blocks, channel: organization_membership.slack_user_id })

    organization_membership.welcomed_to_slack!
  end
end
