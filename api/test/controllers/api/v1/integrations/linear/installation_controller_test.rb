# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      module Linear
        class InstallationControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @member = create(:organization_membership)
            @user = @member.user
            @organization = @user.organizations.first
          end

          describe "#show" do
            test "returns 200 OK when an integration exists" do
              integration = create(:integration, :linear, owner: @organization)

              sign_in @user
              get organization_integrations_linear_installation_path(@organization.slug)

              assert_response :ok
              assert_response_gen_schema

              assert_equal integration.public_id, json_response["id"]
              assert_equal "linear", json_response["provider"]
            end

            test "returns no data when a Linear integration doesn't exist" do
              sign_in @user
              get organization_integrations_linear_installation_path(@organization.slug)

              assert_response :ok
              assert_response_gen_schema

              assert_nil json_response
            end

            test "return 403 for a random user" do
              sign_in create(:user)
              get organization_integrations_linear_installation_path(@organization.slug)
              assert_response :forbidden
            end

            test "return 401 for an unauthenticated user" do
              get organization_integrations_linear_installation_path(@organization.slug)
              assert_response :unauthorized
            end
          end

          describe "#destroy" do
            setup do
              @integration = create(:integration, :linear, owner: @organization)
            end

            test "works for an org admin" do
              sign_in @user
              delete organization_integrations_linear_installation_path(@organization.slug)

              assert_response :no_content

              assert_nil @organization.reload.linear_integration
            end

            test "does not work for an org member" do
              org_member = create(:organization_membership, :member, organization: @organization).user

              sign_in org_member
              delete organization_integrations_linear_installation_path(@organization.slug)

              assert_response :forbidden
              assert @organization.reload.linear_integration
            end

            test "return 403 for a random user" do
              sign_in create(:user)
              delete organization_integrations_linear_installation_path(@organization.slug)
              assert_response :forbidden
            end

            test "return 401 for an unauthenticated user" do
              delete organization_integrations_linear_installation_path(@organization.slug)
              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
