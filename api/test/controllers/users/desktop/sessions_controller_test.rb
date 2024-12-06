# frozen_string_literal: true

require "test_helper"

module Users
  module Desktop
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "auth.campsite.com"
      end

      context "#new" do
        test "renders new_desktop_session page without authentication" do
          get new_desktop_session_path

          assert_response :ok
          assert_includes response.body, "Sign in with browser"
        end

        test "renders new_desktop_session page with authentication" do
          sign_in(create(:user))
          get new_desktop_session_path

          assert_response :ok
          assert_includes response.body, "Sign in with browser"
        end

        test "sets user_return_to to open_desktop_session_path" do
          get new_desktop_session_path

          assert_response :ok
          assert_equal open_desktop_session_url, session["user_return_to"]
        end

        test "redirects requests to new_user_session to new_desktop_session in the desktop app" do
          get new_user_session_path, headers: { "HTTP_USER_AGENT" => desktop_user_agent }

          assert_response :redirect
          assert_equal response.location, new_desktop_session_path
        end

        test "redirects requests to new_user_registration to new_desktop_session in the desktop app" do
          get new_user_registration_path, headers: { "HTTP_USER_AGENT" => desktop_user_agent }

          assert_response :redirect
          assert_equal response.location, new_desktop_session_path
        end

        test "redirects requests to root_path to new_desktop_session in the desktop app" do
          get auth_root_path, headers: { "HTTP_USER_AGENT" => desktop_user_agent }

          assert_response :redirect
          assert_equal response.location, new_desktop_session_path
        end
      end

      context "#show" do
        test "renders open desktop app page for authenticated user" do
          user = create(:user)

          sign_in(user)
          get open_desktop_session_path

          assert_response :ok
          assert_includes response.body, ERB::Util.html_escape(user.reload.desktop_auth_url)
        end

        test "redirects to new_user_session page for unauthenticated users" do
          get open_desktop_session_path

          assert_response :redirect
          assert_equal new_user_session_url, response.location
        end
      end
    end
  end
end
