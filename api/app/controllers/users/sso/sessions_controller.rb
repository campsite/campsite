# frozen_string_literal: true

module Users
  module Sso
    class SessionsController < DeviseController
      prepend_before_action :require_no_authentication, only: [:new, :create]

      around_action :force_database_writing_role, only: [:callback]

      def new
        if Rails.env.development?
          @email = User.dev_user.email
        end

        render("users/sso/sessions/new")
      end

      def create
        email_domain = User.email_domain(permitted_params[:email])
        domain = OrganizationSsoDomain.find_by(domain: email_domain)
        connection = domain&.sso_connection

        if connection
          authorization_url = WorkOS::SSO.authorization_url(
            client_id: Rails.application.credentials&.workos&.client_id,
            connection: connection.id,
            redirect_uri: sign_in_sso_callback_url(host: request.host, protocol: "https"),
          )

          redirect_to(authorization_url)
        else
          flash[:alert] = "Your organization does not support single sign-on."
          redirect_to(sign_in_sso_path)
        end
      rescue WorkOS::APIError
        flash[:alert] = "Your organization does not support single sign-on."
        redirect_to(sign_in_sso_path)
      end

      # GET /sso/callback path to consume profile object from WorkOS
      def callback
        profile_and_token = WorkOS::SSO.profile_and_token(
          client_id: Rails.application.credentials&.workos&.client_id,
          code: params[:code],
        )
        organization = Organization.find_by(workos_organization_id: profile_and_token.profile.organization_id)

        if organization
          user = User.from_sso(profile: profile_and_token.profile, organization: organization)
          if user.valid?
            session[:sso_session_id] = user.workos_profile_id
            sign_in_and_redirect(user)
          else
            flash[:alert] = user.errors.full_messages.join("\n")
            redirect_to(sign_in_sso_path)
          end
        else
          flash[:alert] = "Your organization does not support single sign-on."
          redirect_to(sign_in_sso_path)
        end
      rescue WorkOS::APIError
        flash[:alert] = "An error occured while authenticating, please try again."
        redirect_to(sign_in_sso_path)
      end

      protected

      def permitted_params
        params.require(:user).permit(:email)
      end
    end
  end
end
