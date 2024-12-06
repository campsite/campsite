# frozen_string_literal: true

module Users
  module RecoveryCode
    class SessionsController < DeviseController
      prepend_before_action :require_no_authentication, only: [:new, :create]

      def new
        @user = User.find_by(id: session[:otp_user_id])
        unless @user
          session[:otp_user_id] = nil
          return redirect_to(new_user_session_path)
        end

        if Rails.env.development?
          @recovery_code = @user.generate_two_factor_backup_codes![0]
        end

        render("users/recovery_code/sessions/new")
      end

      def create
        self.resource = warden.authenticate!(
          :recovery_code_authenticatable,
          {
            scope: resource_name,
            recall: "#{controller_path}#new",
          },
        )

        set_flash_message!(:notice, :signed_in)
        sign_in(resource_name, resource)
        respond_with(resource, location: after_sign_in_path_for(resource))
      end
    end
  end
end
