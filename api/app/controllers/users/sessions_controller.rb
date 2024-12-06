# frozen_string_literal: true

module Users
  class SessionsController < Devise::SessionsController
    skip_before_action :require_no_authentication, only: [:desktop]

    def new
      session[:otp_user_id] = nil

      if Rails.env.development?
        self.resource = resource_class.new({
          email: User.dev_user.email,
          password: User.dev_user.password,
        })
        respond_with(resource, serialize_options(resource))
      else
        super
      end
    end

    def create
      self.resource = warden.authenticate!(:database_authenticatable, auth_options)

      if resource.otp_enabled?
        sign_out(resource)
        session[:otp_user_id] = resource.id

        redirect_to(sign_in_otp_path)
      else
        set_flash_message!(:notice, :signed_in)
        sign_in(resource_name, resource)

        respond_with(resource, location: after_sign_in_path_for(resource))
      end
    end

    def desktop
      self.resource = warden.authenticate!(:token_authenticatable, auth_options)
      sign_out(resource)
      sign_in_and_redirect(resource)
    end

    protected

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_in, keys: [:otp_attempt])
    end
  end
end
