# frozen_string_literal: true

require "test_helper"
require "test_helpers/zapier_test_helper"

module Api
  module V1
    module Integrations
      module Zapier
        class BaseControllerTest < ActionDispatch::IntegrationTest
          include ZapierTestHelper

          setup do
            @organization = create(:organization)
            @token = create(:access_token, :zapier, resource_owner: @organization)
            @integration = create(:integration, :zapier, owner: @organization)
            create(:project, organization: @integration.owner, name: "Maintenance")
            create(:project, organization: @integration.owner, name: "Marketing")
          end

          should "work with an integration token" do
            get zapier_integration_projects_path, headers: zapier_app_request_headers(@integration.token)
            assert_response :success
          end

          should "work with an oauth token" do
            get zapier_integration_projects_path, headers: zapier_oauth_request_headers(@token.plaintext_token)
            assert_response :success
          end

          should "return unauthorized if the integration token is invalid" do
            get zapier_integration_projects_path, headers: zapier_app_request_headers("invalid")
            assert_response :unauthorized
          end

          should "return unauthorized if the oauth token is invalid" do
            get zapier_integration_projects_path, headers: zapier_oauth_request_headers("invalid")
            assert_response :unauthorized
          end

          should "return unauthorized if the oauth token is expired" do
            token = create(:access_token, :zapier, resource_owner: @organization, expires_in: 0)
            get zapier_integration_projects_path, headers: zapier_oauth_request_headers(token.plaintext_token)
            assert_response :unauthorized
          end

          should "return unauthorized if a token is missing" do
            get zapier_integration_projects_path
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
