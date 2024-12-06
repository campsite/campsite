# frozen_string_literal: true

require "test_helper"

module Users
  module Sso
    class ReauthorizeSessionsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "auth.campsite.com"
      end

      context "#create" do
        setup do
          @organization = create(:organization, :workos)
          @user = create(:organization_membership, organization: @organization).user
        end

        test "redirects to the workos authorization url with an org_slug" do
          auth_url = "http://workos.com/auth-url"
          connection = workos_connection_fixture(organization_id: @organization.workos_organization_id)

          Organization.any_instance.expects(:sso_connection).returns(connection)
          WorkOS::SSO.expects(:authorization_url)
            .with(
              client_id: Rails.application.credentials&.workos&.client_id,
              connection: connection.id,
              redirect_uri: sign_in_sso_callback_url,
            ).returns(auth_url)

          sign_in @user
          get reauthorize_sso_sessions_path, params: { org_slug: @organization.slug }

          assert_response :redirect
          assert_equal response.redirect_url, auth_url
          assert_nil flash[:alert]
        end

        test "renders an error for any workos errors raised" do
          Organization.any_instance.expects(:sso_connection)
            .returns(workos_connection_fixture(organization_id: @organization.workos_organization_id))
          WorkOS::SSO.expects(:authorization_url).raises(WorkOS::APIError)

          sign_in @user
          get reauthorize_sso_sessions_path, params: { org_slug: @organization.slug }

          assert_response :redirect
          assert_match(/Your organization does not support/, flash[:alert])
        end

        test "renders an error for a random org" do
          sign_in @user
          get reauthorize_sso_sessions_path, params: { org_slug: "rando" }

          assert_response :redirect
          assert_match(/Your organization does not support single sign-on/, flash[:alert])
        end

        test "renders an error for an unauthenticate user" do
          get reauthorize_sso_sessions_path, params: { org_slug: "rando" }

          assert_response :redirect
          assert_match(/You need to sign in or sign up before continuing/, flash[:alert])
        end
      end
    end
  end
end
