# frozen_string_literal: true

require "test_helper"

module Users
  class RegistrationsControllerTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers

    setup do
      host! "auth.campsite.com"
    end

    context "#new" do
      test "stores correct return_to path when set" do
        from = Campsite.base_app_url + "/org/wow"
        get new_user_registration_path, params: { from: from, allow: true }

        assert_response :ok
        assert session[:user_return_to]
        assert_match from.to_s, session[:user_return_to]
      end
    end

    context "#create" do
      test "creates a user and authenticates with valid params" do
        assert_difference -> { User.count } do
          post user_registration_path, params: { user: { email: "harry@example.com", password: "mypasswordisverystrong!!", password_confirmation: "mypasswordisverystrong!!" } }

          assert_response :redirect
          warden = controller.session["warden.user.user.key"]
          assert_equal(warden.first.first, User.last.id)
          assert_nil flash[:alert]
        end
      end

      test "does not create a user with invalid email" do
        assert_no_difference -> { User.count } do
          post user_registration_path, params: { user: { email: "harry@", password: "mypasswordisverystrong!!", password_confirmation: "mypasswordisverystrong!!" } }
        end
      end

      test "does not create a user with invalid password" do
        assert_no_difference -> { User.count } do
          post user_registration_path, params: { user: { email: "harry@example.com", password: "mypasswordisverystrong!!", password_confirmation: "wedonotmatch" } }
        end
      end

      test "creates a user with referrer and landing url cookies" do
        referrer = "referrer.com"
        landing_url = "campsite.com/utm_source=facebook"

        cookies[:referrer] = referrer
        cookies[:landing_url] = landing_url

        post user_registration_path, params: { user: { email: "harry@example.com", password: "mypasswordisverystrong!!", password_confirmation: "mypasswordisverystrong!!" } }

        user = User.last
        assert_equal user.referrer, referrer
        assert_equal user.landing_url, landing_url
      end
    end
  end
end
