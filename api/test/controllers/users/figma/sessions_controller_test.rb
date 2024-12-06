# frozen_string_literal: true

require "test_helper"

module Users
  module Figma
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "auth.campsite.com"
      end

      context "#create" do
        test "creates a new figma key pair" do
          assert_difference -> { FigmaKeyPair.count }, 1 do
            post create_figma_session_path

            assert_response :created
            assert_predicate json_response["read_key"], :present?
            assert_predicate json_response["write_key"], :present?
          end
        end
      end

      context "#show" do
        test "redirects to new_user_session page for authenticated user without write key" do
          user = create(:user)

          sign_in(user)
          get open_figma_session_path

          assert_response :redirect
          assert_equal new_user_session_url, response.location
        end

        test "redirects to new_user_session page for authenticated user with invalid write key" do
          user = create(:user)

          sign_in(user)
          get open_figma_session_path, params: { write_key: "invalid" }

          assert_response :redirect
          assert_equal new_user_session_url, response.location
        end

        test "renders open figma app page for authenticated user" do
          figma_key_pair = FigmaKeyPair.generate
          user = create(:user)

          sign_in(user)

          assert_difference -> { FigmaKeyPair.count }, -1 do
            get open_figma_session_path, params: { write_key: figma_key_pair.write_key }

            assert_response :ok
          end
        end

        test "redirects new user to app to confirm email and create organization" do
          figma_key_pair = FigmaKeyPair.generate
          user = create(:user, :unconfirmed)

          sign_in(user)
          get open_figma_session_path, params: { write_key: figma_key_pair.write_key }

          assert_response :redirect
          assert_equal Campsite.app_url(path: "/"), response.redirect_url
        end

        test "redirects to new_user_session page for unauthenticated users" do
          get open_figma_session_path

          assert_response :redirect
          assert_equal new_user_session_url, response.location
        end
      end
    end
  end
end
