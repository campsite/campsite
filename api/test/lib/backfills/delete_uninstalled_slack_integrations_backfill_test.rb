# frozen_string_literal: true

require "test_helper"

module Backfills
  class DeleteUninstalledSlackIntegrationsBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      setup do
        @integration = create(:integration, provider: :slack)
        @organization = @integration.owner
        @slack_team_id = create(:slack_team_id, integration: @integration).value
      end

      it "doesn't delete Integration with valid token" do
        Slack::Web::Client.any_instance.stubs(:auth_test).returns({
          "ok" => true,
          "url" => "https://campsite-software.slack.com/",
          "team" => "Campsite",
          "user" => "campsite",
          "team_id" => @slack_team_id,
          "user_id" => "U03CKUGCVLM",
          "bot_id" => "B03CNRCLZEF",
          "is_enterprise_install" => false,
        })

        DeleteUninstalledSlackIntegrationsBackfill.run(dry_run: false)

        assert Integration.exists?(@integration.id)
      end

      it "deletes Integration with invalid token" do
        Slack::Web::Client.any_instance.stubs(:apps_uninstall)
        Slack::Web::Client.any_instance.stubs(:auth_test).raises(Slack::Web::Api::Errors::InvalidAuth.new("invalid auth"))

        DeleteUninstalledSlackIntegrationsBackfill.run(dry_run: false)

        assert_not Integration.exists?(@integration.id)
      end

      it "dry-run is a no-op" do
        Slack::Web::Client.any_instance.stubs(:auth_test).raises(Slack::Web::Api::Errors::InvalidAuth.new("invalid auth"))

        DeleteUninstalledSlackIntegrationsBackfill.run

        assert Integration.exists?(@integration.id)
      end
    end
  end
end
