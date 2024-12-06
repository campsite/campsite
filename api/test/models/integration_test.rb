# frozen_string_literal: true

require "test_helper"

class IntegrationTest < ActiveSupport::TestCase
  describe "#destroy" do
    setup do
      @integration = create(:integration, :slack)
    end

    test "removes uninstalls the slack app from the workspace" do
      channel = create(:integration_channel, integration: @integration)

      Slack::Web::Client.any_instance.expects(:apps_uninstall).with(
        client_id: Rails.application.credentials.slack.client_id,
        client_secret: Rails.application.credentials.slack.client_secret,
      )

      Sidekiq::Testing.inline! do
        @integration.destroy!
        assert_not IntegrationChannel.exists?(channel.id)
      end
    end
  end

  describe "#token!" do
    setup do
      @integration = create(:integration, provider: :figma)
    end

    test "returns the token if it's not expired" do
      FigmaClient.expects(:refresh_token).never

      assert_predicate @integration.token!, :present?
    end

    test "refreshes an expired token" do
      @integration.update!(refresh_token: "refresh_foobar", token_expires_at: 1.day.ago)
      new_access_token = "access_foobar"
      expires_in = 7_776_000
      FigmaClient::Oauth.any_instance.expects(:refresh_token).with(@integration.refresh_token).returns({ "access_token" => new_access_token, "expires_in" => expires_in })

      Timecop.freeze do
        assert_equal new_access_token, @integration.token!
        assert_in_delta expires_in.seconds.from_now, @integration.token_expires_at, 2.seconds
      end
    end
  end
end
