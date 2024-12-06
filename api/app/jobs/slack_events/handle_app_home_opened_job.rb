# frozen_string_literal: true

module SlackEvents
  class HandleAppHomeOpenedJob < BaseJob
    sidekiq_options queue: "background", retry: 3

    delegate :mrkdwn_section_block, :mrkdwn_link, to: SlackBlockKit

    def perform(payload)
      event = AppHomeOpened.new(JSON.parse(payload))

      member = OrganizationMembership
        .joins(slack_integration_organization_membership: :data)
        .find_by(integration_organization_membership_data: { name: IntegrationOrganizationMembershipData::INTEGRATION_USER_ID, value: event.user })
      organization = member&.organization || Organization.with_slack_team_id(event.team_id).first
      return unless organization

      if member
        return if member.welcomed_to_slack? || member.notifications.where.not(slack_message_ts: nil).exists?

        member.welcomed_to_slack!
      else
        unrecognized_user = organization.slack_integration.data.find_or_initialize_by(name: IntegrationData::UNRECOGNIZED_USER_ID, value: event.user)
        return if unrecognized_user.persisted?

        unrecognized_user.save!
      end

      blocks = [
        mrkdwn_section_block(text: "🏕️ Your organization’s Campsite is connected to Slack! You can manage notifications in your #{mrkdwn_link(text: "account settings", url: Campsite.user_settings_url)}."),
      ]

      Slack::Web::Client.new(token: organization.slack_token).chat_postMessage({ blocks: blocks, channel: event.channel })
    end
  end
end
