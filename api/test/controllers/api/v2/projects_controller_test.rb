# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V2
    class ProjectsControllerTest < ActionDispatch::IntegrationTest
      include OauthTestHelper

      setup do
        @org = create(:organization)
        @member = create(:organization_membership, organization: @org)
        @org_oauth_app = create(:oauth_application, owner: @org, name: "Campbot")
        @org_app_token = create(:access_token, resource_owner: @org, application: @org_oauth_app)
        @user_app_token = create(:access_token, resource_owner: @member.user, application: @org_oauth_app)
        create(:project, organization: @org, name: "Maintenance")
        create(:project, organization: @org, name: "Marketing")
      end

      context "#index" do
        it "returns a list of projects" do
          get v2_channels_path, headers: oauth_request_headers(token: @org_app_token.plaintext_token)

          assert_response :success
          assert_equal 2, json_response["data"].count
        end

        it "returns a list of projects filtered by name" do
          get v2_channels_path(name: "MAR"), headers: oauth_request_headers(token: @org_app_token.plaintext_token)

          assert_response :success
          assert_equal 1, json_response["data"].count
          assert_equal "Marketing", json_response["data"].first["name"]
        end

        it "does not return archived projects" do
          create(:project, :archived, organization: @org, name: "Archived")

          get v2_channels_path, headers: oauth_request_headers(token: @org_app_token.plaintext_token)

          assert_response :success
          assert_equal 2, json_response["data"].count
        end

        it "does not return private projects with an org token" do
          create(:project, :private, organization: @org, name: "Private")

          get v2_channels_path, headers: oauth_request_headers(token: @org_app_token.plaintext_token)

          assert_response :success
          assert_equal 2, json_response["data"].count
        end

        it "returns private projects the user has access to with a user app token" do
          private_project = create(:project, :private, creator: @member, organization: @org, name: "Private")
          create(:project_membership, organization_membership: @member, project: private_project)

          create(:project, :private, organization: @org, name: "Private")

          get v2_channels_path, headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug)

          assert_response :success
          assert_equal 3, json_response["data"].count
        end

        it "works with a universal oauth app and an org token" do
          app = create(:oauth_application, :universal)
          token = app.access_tokens.create!(resource_owner: @org)

          get v2_channels_path, headers: oauth_request_headers(token: token.plaintext_token)
          assert_response :success
          assert_equal 2, json_response["data"].count
        end

        it "/v2/projects still works" do
          get v2_channels_path, headers: oauth_request_headers(token: @org_app_token.plaintext_token)
          assert_response :success
          assert_equal 2, json_response["data"].count
        end

        it "returns an error if the limit is too high" do
          get v2_channels_path, params: { limit: 51 }, headers: oauth_request_headers(token: @org_app_token.plaintext_token)

          assert_response :unprocessable_entity
          assert_equal "`limit` must be less than or equal to 50.", json_response["error"]["message"]
        end

        it "returns unauthorized if the token is invalid" do
          get v2_channels_path, headers: oauth_request_headers(token: "invalid")
          assert_response :unauthorized
        end

        it "returns unauthorized if the token is missing" do
          get v2_channels_path, headers: oauth_request_headers
          assert_response :unauthorized
        end
      end

      context "#auth" do
        it "does not work with a token for a discarded oauth application" do
          @org_oauth_app.discard
          get v2_channels_path, headers: oauth_request_headers(token: @org_app_token.plaintext_token)
          assert_response :unauthorized
        end

        context "#org_token" do
          it "works with an oauth token" do
            get v2_channels_path, headers: oauth_request_headers(token: @org_app_token.plaintext_token)
            assert_response :success
          end

          it "rejects an org slug header for an org scoped token" do
            get v2_channels_path, headers: oauth_request_headers(token: @org_app_token.plaintext_token, org_slug: @org.slug)
            assert_response :unprocessable_entity
          end
        end

        context "#user_token" do
          it "works with an oauth token" do
            get v2_channels_path, headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug)
            assert_response :success
          end

          it "returns unprocessable if the org slug is missing" do
            get v2_channels_path, headers: oauth_request_headers(token: @user_app_token.plaintext_token)
            assert_response :unprocessable_entity
          end

          it "returns unauthorized if the user is not a member of the org" do
            org2 = create(:organization)

            get v2_channels_path, headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: org2.slug)
            assert_response :unauthorized
          end
        end

        it "returns unauthorized if the oauth token is invalid" do
          get v2_channels_path, headers: oauth_request_headers(token: "invalid")
          assert_response :unauthorized
        end

        it "returns unauthorized if the oauth token is expired" do
          token = create(:access_token, resource_owner: @org, application: @org_oauth_app, expires_in: 0)
          get v2_channels_path, headers: oauth_request_headers(token: token.plaintext_token)
          assert_response :unauthorized
        end

        it "returns unauthorized if a token is missing" do
          get v2_channels_path
          assert_response :unauthorized
        end
      end
    end
  end
end
