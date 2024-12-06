# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Organizations
      class SsoControllerConfigurationTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:organization_membership).user
          @organization = @user.organizations.first
        end

        context "#create" do
          setup do
            @organization.update!(workos_organization_id: "work-os-org-id")
          end

          test "returns the sso portal url for an sso enabled org" do
            WorkOS::Portal.expects(:generate_link).returns("http://example.com/portal")

            sign_in @user
            post organization_sso_configuration_path(@organization.slug)

            assert_response :created
            assert_response_gen_schema
            assert_equal "http://example.com/portal", json_response["sso_portal_url"]
          end

          test "returns an error for an org with sso disabled" do
            @organization.update!(workos_organization_id: nil)

            sign_in @user
            post organization_sso_configuration_path(@organization.slug)

            assert_response :unprocessable_entity
            assert_match(/Single Sign-On authentication/, json_response["message"])
          end

          test "returns an error for an org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member
            post organization_sso_configuration_path(@organization.slug)
            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_sso_configuration_path(@organization.slug)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_sso_configuration_path(@organization.slug)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
