# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Users
      class DesktopSessionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          host! "auth.campsite.com"
        end

        context "#create" do
          setup do
            @user = create(:user)
            @user.generate_login_token!
          end

          test "authenticates a user with valid params" do
            post internal_desktop_session_path, params: { user: { email: @user.email, token: @user.login_token } }, as: :json

            assert_response :created
            warden = controller.session["warden.user.user.key"]
            assert_equal(warden.first.first, @user.id)
          end

          test "does not authenticates a user with invalid params" do
            post internal_desktop_session_path, params: { user: { email: @user.email, token: "invalid" } }, as: :json

            assert_response :unauthorized
            assert_nil controller.session["warden.user.user.key"]
            assert_match(/Your login token has expired/, json_response["error"])
          end

          test "authenticates a user and sets sso_session_id to the value of the stored login_token_sso_id" do
            @user.generate_login_token!(sso_id: "my_sso_id")
            post internal_desktop_session_path, params: { user: { email: @user.email, token: @user.login_token } }, as: :json

            assert_response :created
            warden = controller.session["warden.user.user.key"]
            assert_equal(warden.first.first, @user.id)
            assert_equal(controller.session[:sso_session_id], "my_sso_id")
          end
        end
      end
    end
  end
end
