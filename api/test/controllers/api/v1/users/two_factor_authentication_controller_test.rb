# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class TwoFactorAuthenticationControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
        end

        context "#create" do
          test "generate an otp secret" do
            assert_nil @user.otp_secret

            sign_in @user
            post current_user_two_factor_authentication_path

            assert_response :created
            assert_response_gen_schema

            assert_not_nil json_response["two_factor_provisioning_uri"]
            assert_not_nil @user.otp_secret
          end

          test "returns 200 if otp secret is already generated" do
            @user.generate_two_factor_secret!
            assert_not_nil @user.otp_secret

            sign_in @user
            post current_user_two_factor_authentication_path

            assert_response :created
            assert_response_gen_schema
          end

          test "returns 422 if 2fa is already enabled" do
            @user.update!(otp_enabled: true)

            sign_in @user
            post current_user_two_factor_authentication_path

            assert_response :unprocessable_entity
          end
        end

        context "#update" do
          test "validates and enables 2fa for the user" do
            @user.generate_two_factor_secret!
            assert_not_nil @user.otp_secret
            assert_not_predicate @user, :otp_enabled?

            sign_in @user
            put current_user_two_factor_authentication_path, params: { password: @user.password, otp_attempt: otp_attempt(@user.otp_secret) }

            assert_response :ok
            assert_response_gen_schema
            assert_predicate json_response["two_factor_backup_codes"], :present?
          end

          test "returns 422 if password is invalid" do
            sign_in @user
            put current_user_two_factor_authentication_path, params: { password: "invalid" }

            assert_response :unprocessable_entity
            assert_match(/Invalid password/, json_response["message"])
          end

          test "returns 422 if otp code is invalid" do
            sign_in @user
            put current_user_two_factor_authentication_path, params: { password: @user.password, otp_attempt: "123456" }

            assert_response :unprocessable_entity
            assert_match(/Invalid code/, json_response["message"])
          end

          test "returns 422 if 2fa is already enabled" do
            @user.update!(otp_enabled: true)

            sign_in @user
            put current_user_two_factor_authentication_path

            assert_response :unprocessable_entity
          end
        end

        context "#destroy" do
          test "validates code, user password and disables 2fa" do
            @user.generate_two_factor_secret!
            @user.update!(otp_enabled: true)

            sign_in @user
            delete current_user_two_factor_authentication_path, params: { password: @user.password, otp_attempt: otp_attempt(@user.otp_secret) }

            assert_response :no_content
            assert_equal [], @user.reload.otp_backup_codes
            assert_nil @user.otp_secret
            assert_not_predicate @user, :otp_enabled?
          end

          test "validates backup codes, user password and disables 2fa" do
            codes = @user.generate_two_factor_backup_codes!
            @user.update!(otp_enabled: true)

            sign_in @user
            delete current_user_two_factor_authentication_path, params: { password: @user.password, otp_attempt: codes[0] }

            assert_response :no_content
            assert_equal [], @user.reload.otp_backup_codes
            assert_nil @user.otp_secret
            assert_not_predicate @user, :otp_enabled?
          end

          test "returns 422 if password is invalid" do
            @user.generate_two_factor_secret!
            @user.update!(otp_enabled: true)

            sign_in @user
            delete current_user_two_factor_authentication_path, params: { password: "invalid", otp_attempt: otp_attempt(@user.otp_secret) }

            assert_response :unprocessable_entity
            assert_match(/Invalid password/, json_response["message"])
          end

          test "returns 422 if otp_attempt is invalid" do
            @user.update!(otp_enabled: true)

            sign_in @user
            delete current_user_two_factor_authentication_path, params: { password: @user.password, otp_attempt: "123456" }

            assert_response :unprocessable_entity
            assert_match(/Invalid code/, json_response["message"])
          end

          test "returns 422 if 2fa is not enabled" do
            @user.update!(otp_enabled: false)

            sign_in @user
            delete current_user_two_factor_authentication_path

            assert_response :unprocessable_entity
            assert_match(/authentication is not enabled/, json_response["message"])
          end
        end
      end
    end
  end
end
