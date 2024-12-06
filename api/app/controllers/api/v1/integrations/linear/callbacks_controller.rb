# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Linear
        class CallbacksController < ApplicationController
          extend Apigen::Controller

          around_action :force_database_writing_role, only: [:show]

          prepend_before_action -> { request.format = :html }, only: :show
          before_action :authenticate_user!, only: :show

          def show
            organization = Organization.find_by!(public_id: params[:state])

            authorize(organization, :create_linear_integration?)

            oauth = linear_oauth_client.retrieve_access_token!(code: params[:code], callback_url: linear_integration_callback_url)

            if oauth["access_token"]
              integration = organization.integrations.find_or_initialize_by(provider: :linear)
              integration.update!(creator: current_user, token: oauth["access_token"])
              integration.find_or_initialize_data(IntegrationData::SCOPES).update!(value: oauth["scope"])

              ::Integrations::Linear::SetOrganizationIdJob.perform_async(organization.id)
              ::Integrations::Linear::SyncTeamsJob.perform_async(integration.id)

              redirect_in_integration_auth_client(app_path: integration_auth_params[:success_path])
            else
              @error_message = "Invalid access token"
              render("errors/show", status: :forbidden)
            end
          rescue StandardError => ex
            @error_message = ex.message || "An error occurred"
            render("errors/show", status: :forbidden)
          end

          private

          def linear_oauth_client
            @linear_oauth_client ||= LinearOauth2Client.new(
              client_id: Rails.application.credentials&.dig(:linear, :client_id),
              client_secret: Rails.application.credentials&.dig(:linear, :client_secret),
            )
          end
        end
      end
    end
  end
end
