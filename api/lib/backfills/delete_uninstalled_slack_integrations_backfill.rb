# frozen_string_literal: true

module Backfills
  class DeleteUninstalledSlackIntegrationsBackfill
    def self.run(dry_run: true)
      invalid_token_org_slugs = []

      Organization.joins(:slack_integration).find_each do |organization|
        integration = organization.slack_integration
        client = Slack::Web::Client.new(token: integration.token)

        begin
          client.auth_test
        rescue Slack::Web::Api::Errors::InvalidAuth
          integration.destroy! unless dry_run
          invalid_token_org_slugs.push(organization.slug)
        end
      end

      deleted_integration_count = invalid_token_org_slugs.count
      "#{dry_run ? "Would have deleted" : "deleted"} #{deleted_integration_count} Integration #{"record".pluralize(deleted_integration_count)} (for organizations: #{invalid_token_org_slugs.to_sentence})"
    end
  end
end
