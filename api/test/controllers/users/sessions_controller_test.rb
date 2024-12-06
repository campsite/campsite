# frozen_string_literal: true

require "test_helper"
require "test_helpers/rack_attack_helper"

module Users
  class SessionsControllerTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers
    include RackAttackHelper

    setup do
      host! "auth.campsite.com"
    end

    context "#new" do
      test "stores correct return_to path when set" do
        from = Campsite.base_app_url + "/org/wow"
        get user_session_path, params: { from: from }

        assert session[:user_return_to]
        assert_match from.to_s, session[:user_return_to]
      end

      test "gracefully handles invalid return_to path" do
        get user_session_path, params: { from: "/'[0]" }

        assert_nil session[:user_return_to]
      end
    end

    context "#create" do
      test "authenticates a user with valid params" do
        user = create(:user, password: "mypasswordisverystrong!", password_confirmation: "mypasswordisverystrong!")

        post user_session_path, params: { user: { email: user.email, password: "mypasswordisverystrong!" } }

        assert_response :redirect
        assert_equal "http://app.campsite.test:3000", response.redirect_url
        warden = controller.session["warden.user.user.key"]
        assert_equal(warden.first.first, user.id)
        assert_nil flash[:alert]
      end

      test "redirects to app.campsite.com if user is on campsite.com" do
        host! "auth.campsite.com"
        user = create(:user, password: "mypasswordisverystrong!", password_confirmation: "mypasswordisverystrong!")

        post user_session_path, params: { user: { email: user.email, password: "mypasswordisverystrong!" } }

        assert_response :redirect
        assert_equal "http://app.campsite.test:3000", response.redirect_url
      end

      test "redirects to otp sign in if otp_enabled" do
        user = create(:user, otp_enabled: true, password: "mypasswordisverystrong!", password_confirmation: "mypasswordisverystrong!")

        post user_session_path, params: { user: { email: user.email, password: "mypasswordisverystrong!" } }

        assert_response :redirect
        assert_equal(user.id, controller.session[:otp_user_id])
        assert_includes response.redirect_url, sign_in_otp_path
      end

      test "does not authenticate a user with invalid params" do
        user = create(:user, password: "mypasswordisverystrong!", password_confirmation: "mypasswordisverystrong!")

        post user_session_path, params: { user: { email: user.email, password: "invalid" } }

        assert_response :ok
        assert_nil controller.session["warden.user.user.key"]
        assert_not_nil flash[:alert]
      end

      test "allows a login if another user is rate limited" do
        user = create(:user, password: "mypasswordisverystrong!", password_confirmation: "mypasswordisverystrong!")

        enable_rack_attack do
          6.times do
            Rack::Attack.cache.count("limit logins per email:another@email.com", 1.minute)
          end

          post user_session_path, params: { user: { email: user.email, password: "mypasswordisverystrong!" } }

          assert_response :redirect
        end
      end

      test "rate limits login requests" do
        user = create(:user, password: "mypasswordisverystrong!", password_confirmation: "mypasswordisverystrong!")

        enable_rack_attack do
          6.times do
            Rack::Attack.cache.count("limit logins per email:#{user.email}", 1.minute)
          end

          post user_session_path, params: { user: { email: user.email, password: "mypasswordisverystrong!" } }

          assert_response :too_many_requests
        end
      end
    end

    context "#desktop" do
      setup do
        @user = create(:user)
        @user.generate_login_token!
      end

      test "authenticates a user with valid params" do
        get desktop_session_path, params: { user: { email: @user.email, token: @user.login_token } }

        assert_response :redirect
        warden = controller.session["warden.user.user.key"]
        assert_equal(warden.first.first, @user.id)
        assert_nil flash[:alert]
      end

      test "does not authenticates a user with invalid params" do
        get desktop_session_path, params: { user: { email: @user.email, token: "invalid" } }

        assert_response :ok
        assert_nil controller.session["warden.user.user.key"]
        assert_not_nil flash[:alert]
      end
    end
  end
end
