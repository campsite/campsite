# frozen_string_literal: true

module SlackEvents
  class HandleChannelCreatedJob < BaseJob
    sidekiq_options queue: "background"

    def perform(payload)
      event = ChannelCreated.new(JSON.parse(payload))
      IntegrationChannel::CreateOrUpdateAllFromSlackApi.new(slack_channel_id: event.channel_id, slack_team_id: event.team_id).run
    rescue Slack::Web::Api::Errors::ChannelNotFound => e
      Rails.logger.info("[SlackEvents::HandleChannelCreatedJob] rescued exception #{e.message}")
    end
  end
end
