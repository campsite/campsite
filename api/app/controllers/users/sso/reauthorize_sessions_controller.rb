# frozen_string_literal: true

module Users
  module Sso
    class ReauthorizeSessionsController < ApplicationController
      before_action :authenticate_user!, only: [:show]

      def show
        organization = current_user&.organizations&.friendly&.find_by(slug: params[:org_slug])
        connection = organization&.sso_connection

        if connection
          authorization_url = WorkOS::SSO.authorization_url(
            client_id: Rails.application.credentials&.workos&.client_id,
            connection: connection.id,
            redirect_uri: sign_in_sso_callback_url,
          )

          session["user_return_to"] = open_desktop_session_url if params[:desktop]
          redirect_to(authorization_url)
        else
          flash[:alert] = "Your organization does not support single sign-on."
          redirect_to(sign_in_sso_path)
        end
      rescue WorkOS::APIError
        flash[:alert] = "Your organization does not support single sign-on."
        redirect_to(sign_in_sso_path)
      end
    end
  end
end
