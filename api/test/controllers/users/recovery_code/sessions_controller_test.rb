# frozen_string_literal: true

require "test_helper"

module Users
  module RecoveryCode
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "auth.campsite.com"
      end

      context "#new" do
        test "redirects to sign in page if otp not set" do
          get sign_in_recovery_code_path

          assert_response :redirect
          assert_includes response.redirect_url, new_user_session_path
        end
      end

      context "#create" do
        test "authenticates a user with valid recovery code" do
          user = create(:user, :otp)

          # sign in and get redirected to otp
          post user_session_path, params: { user: { email: user.email, password: user.password } }
          assert_response :redirect
          assert_equal controller.session[:otp_user_id], user.id

          # sign in recovery code
          codes = user.generate_two_factor_backup_codes!
          post sign_in_recovery_code_path, params: { user: { recovery_code: codes[0] } }

          assert_response :redirect
          warden = controller.session["warden.user.user.key"]
          assert_equal(warden.first.first, user.id)
          assert_nil flash[:alert]
        end

        test "does not authenticate a user with invalid recovery code" do
          user = create(:user, :otp)

          # sign in and get redirected to otp
          post user_session_path, params: { user: { email: user.email, password: user.password } }

          # sign in recovery code
          post sign_in_recovery_code_path, params: { user: { recovery_code: "invalid" } }

          assert_response :ok
          assert_nil controller.session["warden.user.user.key"]
          assert_not_nil flash[:alert]
        end
      end
    end
  end
end
