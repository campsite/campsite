# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Discord
        class OrganizationInstallationCallbacksController < BaseController
          extend Apigen::Controller

          skip_before_action :require_authenticated_organization_membership

          response code: 200
          def show
            handle_oauth_callback
          end

          private

          def handle_oauth_callback
            # Exchange authorization code for access token
            token_response = exchange_code_for_token

            if token_response[:error]
              redirect_to_frontend_with_error(token_response[:error])
              return
            end

            # Get guild information
            guild_info = fetch_guild_info(token_response[:access_token])

            if guild_info.nil?
              redirect_to_frontend_with_error("no_admin_guild")
              return
            end

            # Create or update the integration
            integration = current_organization.integrations.discord.first_or_initialize
            integration.update!(
              creator: current_user,
              owner: current_organization,
              token: token_response[:access_token],
              refresh_token: token_response[:refresh_token],
              token_expires_at: token_response[:expires_in].seconds.from_now,
              scopes: token_response[:scope]
            )

            # Store Discord guild ID
            current_organization.update!(discord_guild_id: guild_info["id"])

            # Store guild information
            integration.find_or_initialize_data(IntegrationData::ACCOUNT_NAME).update!(value: guild_info["name"])
            integration.find_or_initialize_data(IntegrationData::ACCOUNT_TYPE).update!(value: "guild")

            # Sync channels
            SyncDiscordChannelsJob.perform_later(integration)

            redirect_to_frontend_with_success
          end

          def exchange_code_for_token
            client_id = Rails.application.credentials.discord.client_id
            client_secret = Rails.application.credentials.discord.client_secret
            redirect_uri = discord_integration_callback_url

            response = HTTP.post("https://discord.com/api/oauth2/token", form: {
              client_id: client_id,
              client_secret: client_secret,
              grant_type: "authorization_code",
              code: params[:code],
              redirect_uri: redirect_uri
            })

            if response.status.success?
              JSON.parse(response.body).symbolize_keys
            else
              { error: "Failed to exchange code for token" }
            end
          end

          def fetch_guild_info(access_token)
            response = HTTP.auth("Bearer #{access_token}")
                          .get("https://discord.com/api/users/@me/guilds")

            return nil unless response.status.success?

            guilds = JSON.parse(response.body)
            # Find the guild that the user is an admin of
            # ADMINISTRATOR permission is 0x8
            guilds.find { |g| g["permissions"].to_i & 0x8 == 0x8 }
          end

          def redirect_to_frontend_with_success
            redirect_to "#{frontend_base_url}/settings/integrations/discord?success=true", allow_other_host: true
          end

          def redirect_to_frontend_with_error(error)
            redirect_to "#{frontend_base_url}/settings/integrations/discord?error=#{CGI.escape(error)}", allow_other_host: true
          end

          def frontend_base_url
            Rails.env.production? ? "https://app.campsite.com" : "http://app.campsite.test:3000"
          end

          def discord_integration_callback_url
            api_v1_discord_integration_callback_url(host: Rails.application.routes.default_url_options[:host])
          end
        end
      end
    end
  end
end