# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      module TwoFactorAuthentication
        class RecoveryCodesControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @user = create(:user)
          end

          context "#create" do
            test "returns recovery codes" do
              @user.update!(otp_enabled: true)
              @user.generate_two_factor_backup_codes!
              @user.generate_two_factor_secret!

              sign_in @user
              post current_user_two_factor_authentication_recovery_codes_path,
                params: { user: { otp_attempt: otp_attempt(@user.otp_secret) } }

              assert_response :created
              assert_predicate json_response["two_factor_backup_codes"], :present?
            end

            test "returns 422 if 2fa is not enabled" do
              @user.update!(otp_enabled: false)

              sign_in @user
              post current_user_two_factor_authentication_recovery_codes_path

              assert_response :not_found
              assert_match(/has not been enabled/, json_response["message"])
            end
          end
        end
      end
    end
  end
end
