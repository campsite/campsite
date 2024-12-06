# frozen_string_literal: true

class IntegrationChannel
  class CreateOrUpdateAllFromSlackApi
    def initialize(slack_channel_id:, slack_team_id:)
      @slack_channel_id = slack_channel_id
      @slack_team_id = slack_team_id
    end

    def run
      slack_team_orgs = Organization.with_slack_team_id(@slack_team_id)
      return if slack_team_orgs.none?

      [].tap do |result|
        slack_team_orgs.each do |org|
          integration = org.slack_integration
          client = Slack::Web::Client.new(token: integration.token)
          slack_channel = SlackChannel.new(client.conversations_info(channel: @slack_channel_id)["channel"])
          integration_channel = integration.channels.create_or_find_by!(provider_channel_id: slack_channel.id) do |channel|
            channel.name = slack_channel.name
          end
          integration_channel.update!(name: slack_channel.name, private: slack_channel.private?)
          SyncSlackChannelMembersJob.perform_async(integration_channel.id) if integration_channel.private?
          result.push(integration_channel)
        end
      end
    end
  end
end
