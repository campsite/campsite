# frozen_string_literal: true

require "test_helper"

module Doorkeeper
  class CustomAuthorizationsControllerTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers

    setup do
      host! "auth.campsite.com"
      @member = create(:organization_membership)
      @user = @member.user
    end

    context "#new" do
      test "does not include the organization picker when creating an AccessGrant for a user" do
        oauth_application = create(:oauth_application, :google_calendar)

        sign_in @user
        get oauth_authorization_path, params: {
          client_id: oauth_application.uid,
          response_type: "code",
          redirect_uri: oauth_application.redirect_uri,
        }

        assert_response :ok
        assert_not_includes response.body, "Organization"
      end

      test "redirects with code if matching access token exists" do
        oauth_application = create(:oauth_application, :google_calendar)
        access_token = create(:access_token, application: oauth_application, resource_owner_id: @user.id)

        sign_in @user
        get oauth_authorization_path, params: {
          client_id: oauth_application.uid,
          response_type: "code",
          redirect_uri: oauth_application.redirect_uri,
          scope: access_token.scopes,
        }

        assert_response :redirect
        assert_includes response.redirect_url, native_oauth_authorization_path
      end

      test "includes the organization picker when creating an AccessGrant for an organization" do
        oauth_application = create(:oauth_application, :zapier)

        sign_in @user
        get oauth_authorization_path, params: {
          client_id: oauth_application.uid,
          response_type: "code",
          redirect_uri: oauth_application.redirect_uri,
        }

        assert_response :ok
        assert_includes response.body, "Organization"
      end

      test "returns not found when the application is discarded" do
        oauth_application = create(:oauth_application, :google_calendar, discarded_at: 5.minutes.ago)

        sign_in @user
        get oauth_authorization_path, params: {
          client_id: oauth_application.uid,
          response_type: "code",
          redirect_uri: oauth_application.redirect_uri,
        }

        assert_response :not_found
      end
    end

    context "#create" do
      test "creates an AccessGrant for a user by default" do
        oauth_application = create(:oauth_application)

        sign_in @user

        post oauth_authorization_path, params: {
          client_id: oauth_application.uid,
          state: "state",
          redirect_uri: oauth_application.redirect_uri,
          response_type: "code",
        }

        assert_response :redirect
        assert_includes response.redirect_url, "code="
        access_grant = AccessGrant.last!
        assert_equal @user.id, access_grant.resource_owner_id
        assert_equal User.polymorphic_name, access_grant.resource_owner_type
      end

      test "creates an AccessGrant for a user when specifying resource_owner_id" do
        oauth_application = create(:oauth_application)

        sign_in @user

        post oauth_authorization_path, params: {
          client_id: oauth_application.uid,
          state: "state",
          redirect_uri: oauth_application.redirect_uri,
          response_type: "code",
          resource_owner_id: @user.id,
        }

        assert_response :redirect
        assert_includes response.redirect_url, "code="
        access_grant = AccessGrant.last!
        assert_equal @user.id, access_grant.resource_owner_id
        assert_equal User.polymorphic_name, access_grant.resource_owner_type
      end

      test "user can't create an AccessGrant for another user" do
        other_user = create(:user)
        oauth_application = create(:oauth_application)

        sign_in @user

        post oauth_authorization_path, params: {
          client_id: oauth_application.uid,
          state: "state",
          redirect_uri: oauth_application.redirect_uri,
          response_type: "code",
          resource_owner_id: other_user.id,
        }

        assert_response :forbidden
      end

      test "creates an AccessGrant for an organization" do
        oauth_application = create(:oauth_application, :zapier, redirect_uri: "https://example.com/callback")

        sign_in @user

        post oauth_authorization_path, params: {
          client_id: oauth_application.uid,
          state: "state",
          redirect_uri: oauth_application.redirect_uri,
          response_type: "code",
          resource_owner_type: "Organization",
          resource_owner_id: @member.organization.id,
        }

        assert_response :redirect
        assert_includes response.redirect_url, "code="
        access_grant = AccessGrant.last!
        assert_equal @member.organization.id, access_grant.resource_owner_id
        assert_equal Organization.polymorphic_name, access_grant.resource_owner_type
      end

      test "user can't create an AccessGrant for an organization they aren't a member of" do
        other_organization = create(:organization)
        oauth_application = create(:oauth_application, :zapier, redirect_uri: "https://example.com/callback")

        sign_in @user

        post oauth_authorization_path, params: {
          client_id: oauth_application.uid,
          state: "state",
          redirect_uri: oauth_application.redirect_uri,
          response_type: "code",
          resource_owner_type: "Organization",
          resource_owner_id: other_organization.id,
        }

        assert_response :forbidden
      end

      context "#v2" do
        test "user can't create an AccessGrant for another user" do
          other_user = create(:user)
          oauth_application = create(:oauth_application)

          sign_in @user

          post oauth_v2_authorizations_path, params: {
            client_id: oauth_application.uid,
            state: "state",
            redirect_uri: oauth_application.redirect_uri,
            response_type: "code",
            resource_owner_id: other_user.id,
          }

          assert_response :forbidden
        end

        test "user can't create an AccessGrant for an organization they aren't a member of" do
          other_organization = create(:organization)
          oauth_application = create(:oauth_application, :zapier, redirect_uri: "https://example.com/callback")

          sign_in @user

          post oauth_v2_authorizations_path, params: {
            client_id: oauth_application.uid,
            state: "state",
            redirect_uri: oauth_application.redirect_uri,
            response_type: "code",
            resource_owner_type: "Organization",
            resource_owner_id: other_organization.id,
          }

          assert_response :forbidden
        end
      end
    end
  end
end
