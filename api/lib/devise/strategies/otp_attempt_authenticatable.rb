# frozen_string_literal: true

module Devise
  module Strategies
    class OtpAttemptAuthenticatable < Devise::Strategies::Base
      def authenticate!
        resource = mapping.to.find(session[:otp_user_id])

        if validate_otp(resource)
          session[:otp_user_id] = nil
          success!(resource)
        else
          fail!(:invalid_otp_code)
        end
      end

      private

      def validate_otp(resource)
        return true unless resource.otp_enabled?
        return if params[scope]["otp_attempt"].nil?

        resource.validate_and_consume_otp!(params[scope]["otp_attempt"])
      end
    end
  end
end
