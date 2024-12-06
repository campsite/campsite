# frozen_string_literal: true

module Devise
  module Strategies
    class RecoveryCodeAuthenticatable < Devise::Strategies::Base
      def authenticate!
        resource = mapping.to.find(session[:otp_user_id])

        if validate_recovery_code(resource)
          session[:otp_user_id] = nil
          success!(resource)
        else
          fail!(:invalid_recovery_code)
        end
      end

      private

      def validate_recovery_code(resource)
        return true unless resource.otp_enabled?
        return if params[scope]["recovery_code"].nil?

        resource.invalidate_otp_backup_code!(params[scope]["recovery_code"])
      end
    end
  end
end
