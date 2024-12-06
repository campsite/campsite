# frozen_string_literal: true

module Api
  module V1
    module OauthApplications
      class TokensController < BaseController
        extend Apigen::Controller

        response model: AccessTokenSerializer, code: 201
        def create
          authorize(current_organization, :manage_integrations?)

          token = oauth_application.access_tokens.create!(
            resource_owner: current_organization,
            expires_in: nil,
          )

          render_json(AccessTokenSerializer, token, status: :created)
        end

        private

        def oauth_application
          @oauth_application ||= current_organization.oauth_applications.find_by(public_id: params[:oauth_application_id])
        end
      end
    end
  end
end
