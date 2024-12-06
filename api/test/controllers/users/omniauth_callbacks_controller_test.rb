# frozen_string_literal: true

require "test_helper"

module Users
  class OmniauthCallbacksControllerTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers

    setup do
      host! "auth.campsite.com"
    end

    context "#google_oauth2" do
      test "creates a user for a valid auth" do
        valid_auth = OmniAuth::AuthHash.new({
          provider: "google_oauth2",
          uid: "123",
          info: {
            email: "harry@example.com",
            name: "harry potter",
          },
        })

        OmniAuth.config.add_mock(:google_oauth2, valid_auth)

        assert_difference -> { User.count } do
          post user_google_oauth2_omniauth_callback_path, env: { "omniauth.auth" => valid_auth }

          user = User.last
          assert_equal "harry@example.com", user.email
          assert_equal "harry potter", user.name
          assert_equal "google_oauth2", user.omniauth_provider
          assert_equal "123", user.omniauth_uid
        end

        assert_response :redirect
        assert_nil flash[:notice]
      end

      test "does not create a user for an invalid auth" do
        invalid_auth = OmniAuth::AuthHash.new({
          provider: "google_oauth2",
          uid: "123",
          info: {
            email: nil, # makes the user creation invalid
            name: "harry potter",
          },
        })

        OmniAuth.config.add_mock(:google_oauth2, invalid_auth)

        assert_no_difference -> { User.count } do
          post user_google_oauth2_omniauth_callback_path, env: { "omniauth.auth" => invalid_auth }
        end
      end
    end

    context "#desktop" do
      test "creates a user for a valid auth and redirects to app desktop auth url" do
        valid_auth = OmniAuth::AuthHash.new({
          provider: "desktop",
          uid: "123",
          info: {
            email: "harry@example.com",
            name: "harry potter",
          },
        })

        OmniAuth.config.add_mock(:desktop, valid_auth)

        assert_difference -> { User.count } do
          post user_desktop_omniauth_callback_path, env: { "omniauth.auth" => valid_auth }

          user = User.last
          assert_equal "harry@example.com", user.email
          assert_equal "harry potter", user.name
          assert_equal "google_oauth2", user.omniauth_provider
          assert_equal "123", user.omniauth_uid

          assert_response :ok
          assert_includes response.body, "campsite-dev://auth/desktop?email=#{user.email}&amp;token=#{user.login_token}"
        end
      end

      test "does not create a new user from an existing google_oauth2 provider" do
        valid_auth = OmniAuth::AuthHash.new({
          provider: "desktop",
          uid: "123",
          info: {
            email: "harry@example.com",
            name: "harry potter",
          },
        })
        OmniAuth.config.add_mock(:desktop, valid_auth)

        user = create(
          :user,
          email: "harry@example.com",
          name: "harry potter",
          omniauth_uid: "123",
          omniauth_provider: "google_oauth2",
        )

        assert_no_difference -> { User.count } do
          post user_desktop_omniauth_callback_path, env: { "omniauth.auth" => valid_auth }

          assert_response :ok
          assert_includes response.body, "campsite-dev://auth/desktop?email=#{user.email}&amp;token=#{user.login_token}"
        end
      end

      test "does not create a user for an invalid auth" do
        invalid_auth = OmniAuth::AuthHash.new({
          provider: "desktop",
          uid: "123",
          info: {
            email: nil, # makes the user creation invalid
            name: "harry potter",
          },
        })

        OmniAuth.config.add_mock(:desktop, invalid_auth)

        assert_no_difference -> { User.count } do
          post user_desktop_omniauth_callback_path, env: { "omniauth.auth" => invalid_auth }
        end
      end
    end
  end
end
