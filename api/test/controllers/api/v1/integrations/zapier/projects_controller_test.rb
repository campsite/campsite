# frozen_string_literal: true

require "test_helper"
require "test_helpers/zapier_test_helper"

module Api
  module V1
    module Integrations
      module Zapier
        class ProjectsControllerTest < ActionDispatch::IntegrationTest
          include ZapierTestHelper

          context "#index" do
            setup do
              @organization = create(:organization)
              @integration = create(:integration, :zapier, owner: @organization)
              create(:project, organization: @integration.owner, name: "Maintenance")
              create(:project, organization: @integration.owner, name: "Marketing")
            end

            should "return a list of projects" do
              get zapier_integration_projects_path, headers: zapier_app_request_headers(@integration.token)

              assert_response :success
              assert_equal 2, json_response.count
            end

            should "return a list of projects using oauth token" do
              token = create(:access_token, :zapier, resource_owner: @organization)
              get zapier_integration_projects_path, headers: zapier_oauth_request_headers(token.plaintext_token)

              assert_response :success
              assert_equal 2, json_response.count
            end

            should "return a list of projects filtered by name" do
              get zapier_integration_projects_path(name: "MAR"), headers: zapier_app_request_headers(@integration.token)

              assert_response :success
              assert_equal 1, json_response.count
              assert_equal "Marketing", json_response.first["name"]
            end

            should "not return private or archived projects" do
              create(:project, :private, organization: @integration.owner, name: "Private")
              create(:project, :archived, organization: @integration.owner, name: "Archived")

              get zapier_integration_projects_path, headers: zapier_app_request_headers(@integration.token)

              assert_response :success
              assert_equal 2, json_response.count
            end

            should "return unauthorized if the token is invalid" do
              get zapier_integration_projects_path, headers: zapier_app_request_headers("invalid")
              assert_response :unauthorized
            end

            should "return unauthorized if the token is missing" do
              get zapier_integration_projects_path
              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
