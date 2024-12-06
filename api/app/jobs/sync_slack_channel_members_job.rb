# frozen_string_literal: true

class SyncSlackChannelMembersJob < BaseJob
  sidekiq_options queue: "background"

  def perform(integration_channel_id)
    integration_channel = IntegrationChannel.find(integration_channel_id)
    client = Slack::Web::Client.new(token: integration_channel.integration.token)

    member_ids = []
    next_cursor = nil

    loop do
      options = { channel: integration_channel.provider_channel_id, limit: 1000 }
      options[:cursor] = next_cursor if next_cursor
      result = conversations_members(client: client, options: options)
      member_ids += result["members"]
      next_cursor = result.dig("response_metadata", "next_cursor")
      break if next_cursor.blank?
    end

    return if member_ids.none?

    member_ids.each { |id| integration_channel.members.create_or_find_by!(provider_member_id: id) }
    integration_channel.members.where.not(provider_member_id: member_ids).destroy_all
  end

  private

  def conversations_members(client:, options:)
    client.conversations_members(options)
  rescue Slack::Web::Api::Errors::TooManyRequestsError => e
    sleep(e.retry_after || 30)
    conversations_members(client: client, options: options)
  end
end
