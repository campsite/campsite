# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class OrganizationMembershipRequestsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:organization_membership).user
        @organization = @user.organizations.first
        @other_user = create(:user)
      end

      context "#index" do
        setup do
          @member = create(:organization_membership, :member, organization: @organization)
          create(:organization_membership_request, organization: @organization)
          create(:organization_membership_request, organization: @organization)
        end

        test "returns paginated membership requests for an admin" do
          sign_in @user
          get organization_membership_requests_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal 2, json_response["data"].length
          expected_ids = @organization.membership_requests.pluck(:public_id).sort
          assert_equal expected_ids, json_response["data"].pluck("id").sort
        end

        test "returns forbidden for an org member" do
          sign_in @member.user
          get organization_membership_requests_path(@organization.slug)

          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_membership_requests_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_membership_requests_path(@organization.slug)
          assert_response :unauthorized
        end
      end

      context "#create" do
        before do
          @suggested_org = create(:organization, email_domain: "example.com")
        end

        test "creates a request for a user suggested org" do
          sign_in @user
          post organization_membership_requests_path(@suggested_org.slug)

          assert_response :created
          assert_response_gen_schema
          assert_equal @suggested_org.slug, json_response["organization_slug"]
        end

        test "returns 422 if already requested" do
          create(:organization_membership_request, organization: @suggested_org, user: @user)

          sign_in @user
          post organization_membership_requests_path(@suggested_org.slug)

          assert_response :unprocessable_entity
          assert_equal "Organization membership already requested", json_response["message"]
        end

        test "return 401 for an unauthenticated user" do
          post organization_membership_requests_path(@suggested_org.slug)
          assert_response :unauthorized
        end
      end

      context "#show" do
        before do
          @other_org = create(:organization)
        end

        test "returns requested: true if request exists" do
          create(:organization_membership_request, organization: @other_org, user: @user)

          sign_in @user
          get organization_membership_request_path(@other_org.slug)

          assert_response :ok
          assert json_response["requested"]
        end

        test "returns requested: false if request doesn't exist" do
          sign_in @user
          get organization_membership_request_path(@other_org.slug)

          assert_response :ok
          assert_not json_response["requested"]
        end
      end

      context "#approve" do
        setup do
          @membership_request = create(:organization_membership_request, organization: @organization, user: @other_user)
        end

        test "works for an admin" do
          sign_in @user
          post organization_approve_membership_request_path(@organization.slug, @membership_request.public_id)

          assert_response :no_content
          assert_includes @organization.members, @other_user
          member = @organization.memberships.find_by(user: @other_user)
          assert_equal Role::VIEWER_NAME, member.role_name
        end

        test "returns 403 for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          post organization_approve_membership_request_path(@organization.slug, @membership_request.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organization_approve_membership_request_path(@organization.slug, @membership_request.public_id)
          assert_response :unauthorized
        end
      end

      context "#decline" do
        setup do
          @membership_request = create(:organization_membership_request, organization: @organization, user: @other_user)
        end

        test "works for an admin" do
          sign_in @user
          post organization_decline_membership_request_path(@organization.slug, @membership_request.public_id)

          assert_response :no_content
          assert_nil OrganizationMembershipRequest.find_by(id: @membership_request.id)
          assert_not_includes @organization.members, @other_user
        end

        test "returns 403 for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          post organization_decline_membership_request_path(@organization.slug, @membership_request.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organization_decline_membership_request_path(@organization.slug, @membership_request.public_id)
          assert_response :unauthorized
        end
      end
    end
  end
end
