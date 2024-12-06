# frozen_string_literal: true

require "test_helper"

module Users
  module Sso
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "auth.campsite.com"
      end

      context "#new" do
        test "renders single sign-in" do
          get sign_in_sso_path

          assert_response :ok
          assert_includes response.body, "Single sign-on authentication"
        end
      end

      context "#create" do
        setup do
          @organization = create(:organization, :workos)
          @user = create(:organization_membership, organization: @organization).user
        end

        test "redirects to the workos authorization url with a sso email domain" do
          auth_url = "http://workos.com/auth-url"
          connection = workos_connection_fixture(organization_id: @organization.workos_organization_id)
          create(:organization_sso_domain, domain: @user.email_domain, organization: @organization)

          Organization.any_instance.expects(:sso_connection).returns(connection)
          WorkOS::SSO.expects(:authorization_url)
            .with(
              client_id: Rails.application.credentials&.workos&.client_id,
              connection: connection.id,
              redirect_uri: "https://auth.campsite.com/sign-in/sso/callback",
            ).returns(auth_url)

          post sign_in_sso_path, params: { user: { email: @user.email } }

          assert_response :redirect
          assert_equal response.redirect_url, auth_url
          assert_nil flash[:alert]
        end

        test "uses campsite.com in redirect_uri when initiated from campsite.com" do
          host! "auth.campsite.com"
          auth_url = "http://workos.com/auth-url"
          connection = workos_connection_fixture(organization_id: @organization.workos_organization_id)
          create(:organization_sso_domain, domain: @user.email_domain, organization: @organization)

          Organization.any_instance.expects(:sso_connection).returns(connection)
          WorkOS::SSO.expects(:authorization_url)
            .with(
              client_id: Rails.application.credentials&.workos&.client_id,
              connection: connection.id,
              redirect_uri: "https://auth.campsite.com/sign-in/sso/callback",
            ).returns(auth_url)

          post sign_in_sso_path, params: { user: { email: @user.email } }

          assert_response :redirect
          assert_equal response.redirect_url, auth_url
          assert_nil flash[:alert]
        end

        test "renders an error for any workos errors raised" do
          create(:organization_sso_domain, domain: @user.email_domain, organization: @organization)

          Organization.any_instance.expects(:sso_connection)
            .returns(workos_connection_fixture(organization_id: @organization.workos_organization_id))
          WorkOS::SSO.expects(:authorization_url).raises(WorkOS::APIError)

          post sign_in_sso_path, params: { user: { email: @user.email } }

          assert_response :redirect
          assert_match(/Your organization does not support/, flash[:alert])
        end

        test "renders an error for an invalid user email" do
          post sign_in_sso_path, params: { user: { email: "invalid@" } }

          assert_response :redirect
          assert_match(/Your organization does not support single sign-on/, flash[:alert])
        end
      end

      context "#callback" do
        test "signs in and redirects a user after successful sso" do
          org = create(:organization, :workos)
          WorkOS::SSO.stubs(:profile_and_token)
            .returns(ProfileAndToken.new(access_token: "token", profile: workos_profile_fixture(organization_id: org.workos_organization_id)))

          assert_difference -> { User.count } do
            get sign_in_sso_callback_path, params: { code: "workos-code" }

            assert_response :redirect
            user = User.last
            member = user.organization_memberships.last
            assert_equal true, org.member?(user)
            assert_equal Role::MEMBER_NAME, member.role_name
            assert_equal user.workos_profile_id, request.session[:sso_session_id]
          end
        end

        test "sets role for new user from organization setting if present" do
          org = create(:organization, :workos)
          org.update_setting(OrganizationSetting::NEW_SSO_MEMBER_ROLE_NAME_KEY, Role::VIEWER_NAME)
          WorkOS::SSO.stubs(:profile_and_token)
            .returns(ProfileAndToken.new(access_token: "token", profile: workos_profile_fixture(organization_id: org.workos_organization_id)))

          get sign_in_sso_callback_path, params: { code: "workos-code" }

          assert_response :redirect
          user = User.last
          member = user.organization_memberships.last
          assert_equal Role::VIEWER_NAME, member.role_name
        end

        test "renders an error for an unkown org" do
          WorkOS::SSO.stubs(:profile_and_token)
            .returns(ProfileAndToken.new(access_token: "token", profile: workos_profile_fixture(organization_id: "some-id")))

          get sign_in_sso_callback_path, params: { code: "workos-code" }

          assert_response :redirect
          assert_match(/Your organization does not support/, flash[:alert])
        end
      end
    end
  end
end
