# frozen_string_literal: true

module Api
  module V1
    module Users
      module TwoFactorAuthentication
        class RecoveryCodesController < V1::BaseController
          skip_before_action :require_authenticated_organization_membership, only: :create

          def create
            unless current_user.otp_enabled?
              return render_error(status: :not_found, code: "not_found", message: "Two factor authentication has not been enabled.")
            end

            if current_user.validate_and_consume_otp!(permitted_params[:otp_attempt])
              # backup codes are stored as bcrypt hashes, for users to view
              # their backup codes we generate a new set
              render(json: { two_factor_backup_codes: current_user.generate_two_factor_backup_codes! }, status: :created)
            else
              render_error(status: :unprocessable_entity, code: "unprocessable", message: "Invalid code. Please try again")
            end
          end

          private

          def permitted_params
            params.require(:user).permit(:otp_attempt, :otp_backup_codes, :password)
          end
        end
      end
    end
  end
end
