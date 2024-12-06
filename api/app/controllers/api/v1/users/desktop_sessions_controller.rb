# frozen_string_literal: true

module Api
  module V1
    module Users
      class DesktopSessionsController < Devise::RegistrationsController
        skip_before_action :verify_authenticity_token, only: [:create]

        extend Apigen::Controller

        respond_to :json

        response code: 201
        request_params do
          {
            user: {
              type: :object,
              properties: {
                email: { type: :string },
                token: { type: :string },
              },
            },
          }
        end
        def create
          user = warden.authenticate!(:token_authenticatable, auth_options)
          sign_out(user)
          sign_in(user)

          session[:sso_session_id] = user.login_token_sso_id

          render(json: {}, status: :created)
        end

        private

        def auth_options
          { scope: :user, recall: "#{controller_path}#new" }
        end
      end
    end
  end
end
