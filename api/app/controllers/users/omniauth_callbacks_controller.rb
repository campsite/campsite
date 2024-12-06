# frozen_string_literal: true

module Users
  class OmniauthCallbacksController < Devise::OmniauthCallbacksController
    include DatabaseRoleSwitchable

    around_action :force_database_writing_role, only: [:google_oauth2, :desktop]

    skip_before_action :verify_authenticity_token, only: [:google_oauth2, :desktop]

    def google_oauth2
      # You need to implement the method below in your model (e.g. app/models/user.rb)
      @user = User.from_omniauth(request.env["omniauth.auth"])

      if @user.valid?
        sign_in_and_redirect(@user)
      else
        flash[:alert] = @user.errors.full_messages.join("\n")
        redirect_to(new_user_registration_url)
      end
    end

    def desktop
      # set the provider to "google_oauth2" so we do not
      # attempt recreating an exsiting user with a new
      # provider called "desktop"
      token = request.env["omniauth.auth"]
      token.provider = "google_oauth2"
      @user = User.from_omniauth(token)

      if @user.valid?
        @user.generate_login_token!

        sign_in(@user)
      else
        Rails.logger.info("user is invalid #{@user.errors.full_messages}")
        flash[:alert] = @user.errors.full_messages.join("\n")
        redirect_to(new_user_registration_url)
      end
    end

    def failure
      redirect_to(new_user_registration_url)
    end
  end
end
