# frozen_string_literal: true

module Users
  module Otp
    class SessionsController < DeviseController
      prepend_before_action :require_no_authentication, only: [:new, :create]

      def new
        @user = User.find_by(id: session[:otp_user_id])
        unless @user
          session[:otp_user_id] = nil
          return redirect_to(new_user_session_path)
        end

        if Rails.env.development?
          @otp_attempt = ROTP::TOTP.new(@user.otp_secret).at(Time.current)
        end

        render("users/otp/sessions/new")
      end

      def create
        self.resource = warden.authenticate!(
          :otp_attempt_authenticatable,
          {
            scope: resource_name,
            recall: "#{controller_path}#new",
          },
        )

        set_flash_message!(:notice, :signed_in)
        sign_in(resource_name, resource)

        respond_with(resource, location: after_sign_in_path_for(resource))
      end

      protected

      def configure_permitted_parameters
        devise_parameter_sanitizer.permit(:sign_in, keys: [:otp_attempt])
      end
    end
  end
end
