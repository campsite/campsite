# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Organizations
      class SsoControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:organization_membership).user
          @organization = @user.organizations.first
        end

        context "#create" do
          test "enables sso authentication for the org" do
            WorkOS::Organizations.expects(:create_organization).returns(workos_organization_fixture)

            sign_in @user
            post organization_sso_path(@organization.slug), params: { domains: ["example.com", "example.org"] }

            assert_response :created
            assert_response_gen_schema
            assert_equal true, json_response["sso_enabled"]
          end

          test "returns an error for an org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member
            post organization_sso_path(@organization.slug), params: { domains: ["example.com", "example.org"] }
            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_sso_path(@organization.slug), params: { domains: ["example.com", "example.org"] }
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_sso_path(@organization.slug), params: { domains: ["example.com", "example.org"] }
            assert_response :unauthorized
          end
        end

        context "#destroy" do
          setup do
            @organization.update!(workos_organization_id: "work-os-org-id")
          end

          test "disables sso for the org" do
            WorkOS::Organizations.expects(:delete_organization)

            sso_sign_in(user: @user, organization: @organization)
            delete organization_sso_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_not_predicate @organization.reload, :workos_organization?
            assert_equal false, json_response["sso_enabled"]
          end

          test "returns an error for an org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sso_sign_in(user: member, organization: @organization)
            delete organization_sso_path(@organization.slug)
            assert_response :forbidden
            assert_predicate @organization.reload, :workos_organization?
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            delete organization_sso_path(@organization.slug)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_sso_path(@organization.slug)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
