# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Figma
        class CallbacksController < ApplicationController
          around_action :force_database_writing_role, only: [:show]

          prepend_before_action -> { request.format = :html }, only: :show
          before_action :authenticate_user!, only: :show

          def show
            authorize(current_user, :create_figma_integration?)

            exchange_response = FigmaClient::Oauth.new.token(
              redirect_uri: figma_integration_callback_url(subdomain: Campsite.api_subdomain),
              code: params[:code],
            )

            integration = current_user.integrations.find_or_initialize_by(provider: :figma)
            integration.update!(
              creator: current_user,
              token: exchange_response["access_token"],
              refresh_token: exchange_response["refresh_token"],
              token_expires_at: exchange_response["expires_in"].seconds.from_now,
            )
            UpdateFigmaUserJob.perform_async(integration.id)

            redirect_in_integration_auth_client(app_path: integration_auth_params[:success_path])
          rescue FigmaClient::FigmaClientError, Pundit::NotAuthorizedError => ex
            @error_message = ex.message
            render("errors/show", status: :forbidden)
          end
        end
      end
    end
  end
end
