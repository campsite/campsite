# frozen_string_literal: true

module Api
  module V1
    class DiscordIntegrationsController < BaseController
      skip_before_action :require_authenticated_user, only: :webhook
      skip_before_action :require_authenticated_organization_membership, only: :webhook
      before_action :validate_webhook_request, only: :webhook

      extend Apigen::Controller

      response model: DiscordIntegrationSerializer, code: 200
      def show
        authorize(current_organization, :show_discord_integration?)

        view = current_organization.admin?(current_user) ? :with_token : nil
        if current_organization.discord_integration
          render_json(
            DiscordIntegrationSerializer,
            current_organization.discord_integration,
            {
              view: view,
              current_organization_membership: current_organization_membership,
            },
          )
        else
          render(status: :ok, json: nil)
        end
      end

      response code: 204
      def destroy
        authorize(current_organization, :destroy_discord_integration?)

        current_organization.discord_integration&.destroy!
        current_organization.update!(discord_guild_id: nil)
        current_organization.projects.where.not(discord_channel_id: nil).update_all(discord_channel_id: nil)
      end

      # Discord webhook endpoint for receiving events
      def webhook
        # Some Discord events (like MESSAGE_DELETE) may not have an id field.
        # Generate a unique identifier to ensure uniqueness constraint is satisfied.
        event_id = params[:d][:id] || "generated-#{SecureRandom.uuid}"

        event = DiscordEvent.create!(
          event_type: params[:t],
          event_id: event_id,
          payload: params[:d]
        )

        ProcessDiscordEventJob.perform_later(event)
        render_ok
      end

      private

      def validate_webhook_request
        # Verify Discord webhook signature
        # https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization
        signature = request.headers["X-Signature-Ed25519"]
        timestamp = request.headers["X-Signature-Timestamp"]
        
        return head :unauthorized unless signature && timestamp

        public_key = Rails.application.credentials.discord.webhook_public_key
        return head :unauthorized unless public_key

        message = timestamp + request.raw_post
        
        begin
          verify_key = Ed25519::VerifyKey.new([public_key].pack("H*"))
          verify_key.verify([signature].pack("H*"), message)
        rescue Ed25519::VerifyError
          head :unauthorized
        end
      end
    end
  end
end