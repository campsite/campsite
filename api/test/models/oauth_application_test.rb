# frozen_string_literal: true

require "test_helper"

class OauthApplicationTest < ActiveSupport::TestCase
  context "user owner" do
    test "can be created for a user" do
      app = create(:oauth_application)
      assert app.owner.is_a?(User)
    end
  end

  context "organization owner" do
    test "can be created for an organization" do
      app = create(:oauth_application, :organization)
      assert app.owner.is_a?(Organization)
    end
  end

  context "#discard" do
    test "revokes tokens when discarded" do
      token = create(:access_token)
      assert_not token.revoked?
      token.application.discard
      assert token.reload.revoked?
    end

    test "removes from message threads when discarded" do
      member = create(:organization_membership)
      thread = create(:message_thread, owner: member)
      oauth_application = create(:oauth_application, owner: member.organization)

      thread.add_oauth_application!(oauth_application: oauth_application, actor: member)
      assert_includes thread.oauth_applications, oauth_application

      oauth_application.discard
      assert_not_includes thread.reload.oauth_applications, oauth_application
    end

    test "deactivates webhooks and cancels pending events when discarded" do
      webhook = create(:webhook)
      event = create(:webhook_event, webhook: webhook, status: :pending)

      webhook.owner.discard
      assert_equal "disabled", webhook.reload.state
      assert_not_nil webhook.discarded_at
      assert_equal "canceled", event.reload.status
    end
  end
end
