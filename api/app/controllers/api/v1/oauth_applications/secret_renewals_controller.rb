# frozen_string_literal: true

module Api
  module V1
    module OauthApplications
      class SecretRenewalsController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: OauthApplicationSerializer, code: 200
        def create
          authorize(current_oauth_application, :renew_secret?)

          new_secret = current_oauth_application.renew_secret

          current_oauth_application.last_copied_secret_at = Time.current
          current_oauth_application.save!

          render_json(OauthApplicationSerializer, current_oauth_application, {
            plaintext_secret: new_secret,
          })
        end

        private

        def current_oauth_application
          @current_oauth_application ||= current_organization.kept_oauth_applications.find_by!(public_id: params[:oauth_application_id])
        end
      end
    end
  end
end
