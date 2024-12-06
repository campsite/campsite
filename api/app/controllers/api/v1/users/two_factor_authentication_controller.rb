# frozen_string_literal: true

module Api
  module V1
    module Users
      class TwoFactorAuthenticationController < V1::BaseController
        skip_before_action :require_authenticated_organization_membership, only: [:create, :update, :destroy]

        extend Apigen::Controller

        response code: 201 do
          { two_factor_provisioning_uri: { type: :string } }
        end
        def create
          if current_user.otp_enabled?
            return render_error(status: :unprocessable_entity, code: "unprocessable", message: "Two factor authentication has already been enabled.")
          end

          if current_user.otp_secret.blank?
            current_user.generate_two_factor_secret!
          end

          render(json: { two_factor_provisioning_uri: current_user.two_factor_provisioning_uri }, status: :created)
        end

        response code: 200 do
          { two_factor_backup_codes: { type: :string, is_array: true } }
        end
        request_params do
          {
            password: { type: :string },
            otp_attempt: { type: :string },
          }
        end
        def update
          if current_user.otp_enabled?
            return render_error(status: :unprocessable_entity, code: "unprocessable", message: "Two factor authentication has already been enabled.")
          end

          unless current_user.valid_password?(permitted_params[:password])
            return render_error(status: :unprocessable_entity, code: "unprocessable", message: "Invalid password. Please try again")
          end

          if current_user.validate_and_consume_otp!(permitted_params[:otp_attempt])
            current_user.enable_two_factor!
            render(json: { two_factor_backup_codes: current_user.generate_two_factor_backup_codes! })
          else
            render_error(status: :unprocessable_entity, code: "unprocessable", message: "Invalid code. Please try again")
          end
        end

        response code: 204
        request_params do
          {
            password: { type: :string },
            otp_attempt: { type: :string },
          }
        end
        def destroy
          unless current_user.otp_enabled?
            return render_error(status: :unprocessable_entity, code: "unprocessable", message: "Two factor authentication is not enabled.")
          end

          unless current_user.valid_password?(permitted_params[:password])
            return render_error(status: :unprocessable_entity, code: "unprocessable", message: "Invalid password. Please try again")
          end

          # allow disabling 2fa with backup codes
          if current_user.validate_and_consume_otp!(permitted_params[:otp_attempt]) || current_user.invalidate_otp_backup_code!(permitted_params[:otp_attempt])
            current_user.disable_two_factor!
          else
            render_error(status: :unprocessable_entity, code: "unprocessable", message: "Invalid code. Please try again")
          end
        end

        private

        def permitted_params
          params.permit(:otp_attempt, :otp_backup_codes, :password)
        end
      end
    end
  end
end
