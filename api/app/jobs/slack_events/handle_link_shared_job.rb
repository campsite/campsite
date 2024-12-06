# frozen_string_literal: true

module SlackEvents
  class HandleLinkSharedJob < BaseJob
    sidekiq_options queue: "background"

    def perform(payload)
      event = LinkShared.new(JSON.parse(payload))

      slack_team_orgs = Organization.with_slack_team_id(event.team_id)
      return if slack_team_orgs.none?

      unfurls = event.links.map.with_object({}) do |link, result|
        next unless link.resource &&
          slack_team_orgs.include?(link.resource.organization) &&
          link.unfurl

        result[link.url] = link.unfurl
      end
      return if unfurls.none?

      chat_unfurl(event: event, slack_team_orgs: slack_team_orgs, unfurls: unfurls)
    rescue Slack::Web::Api::Errors::CannotFindMessage, Slack::Web::Api::Errors::CannotUnfurlMessage => e
      Rails.logger.info("[SlackEvents::HandleLinkSharedJob] rescued exception #{e.message}")
    end

    private

    def chat_unfurl(event:, slack_team_orgs:, unfurls:)
      slack_team_orgs.first.slack_client.chat_unfurl({
        channel: event.channel,
        ts: event.message_ts,
        unfurls: unfurls.to_json,
      })
    rescue Slack::Web::Api::Errors::MissingScope, Slack::Web::Api::Errors::InvalidAuth, Slack::Web::Api::Errors::AccountInactive => e
      raise e if slack_team_orgs.one?

      chat_unfurl(event: event, slack_team_orgs: slack_team_orgs[1..], unfurls: unfurls)
    end
  end
end
