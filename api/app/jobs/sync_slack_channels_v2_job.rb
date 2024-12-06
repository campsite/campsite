# frozen_string_literal: true

class SyncSlackChannelsV2Job < BaseJob
  MINIMUM_DURATION_BETWEEN_SYNCS = 2.minutes

  sidekiq_options queue: "background"

  def perform(integration_id, next_cursor = nil)
    integration = Integration.slack.find_by(id: integration_id)
    return unless integration

    is_first_page = next_cursor.nil?
    if is_first_page
      return if integration.channels_last_synced_at&.after?(MINIMUM_DURATION_BETWEEN_SYNCS.ago)

      integration.channels_synced!
    end

    client = Slack::Web::Client.new(token: integration.token)
    scoped_types = integration.has_private_channel_scopes? ? "public_channel,private_channel" : "public_channel"
    options = { exclude_archived: true, types: scoped_types, limit: 1000 }
    options[:cursor] = next_cursor if next_cursor
    result = client.conversations_list(options)

    result["channels"].each do |channel_data|
      channel = integration.channels.create_or_find_by(provider_channel_id: channel_data["id"]) do |c|
        c.name = channel_data["name"]
      end
      channel.update!(name: channel_data["name"], private: channel_data["is_private"])
      channel.touch
      SyncSlackChannelMembersJob.perform_async(channel.id) if channel.private?
    end

    new_next_cursor = result.dig("response_metadata", "next_cursor")
    if new_next_cursor.blank?
      integration.channels.where(updated_at: ..integration.channels_last_synced_at).destroy_all
      return
    end

    SyncSlackChannelsV2Job.perform_async(integration_id, new_next_cursor)
  rescue Slack::Web::Api::Errors::TooManyRequestsError => e
    SyncSlackChannelsV2Job.perform_in(e.retry_after || 30, integration_id, next_cursor)
  end
end
