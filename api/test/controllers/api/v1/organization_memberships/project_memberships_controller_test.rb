# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OrganizationMemberships
      class ProjectMembershipsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @org_member = create(:organization_membership, organization: @organization)
          @project = create(:project, organization: @organization)
        end

        context "#index" do
          test "works for an org admin" do
            create(:project_membership, project: @project, organization_membership: @org_member)

            sign_in create(:organization_membership, organization: @organization).user

            assert_query_count 9 do
              get organization_member_project_memberships_path(@organization.slug, @org_member.username)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal @project.public_id, json_response["data"][0]["project"]["id"]
            assert_equal @project.name, json_response["data"][0]["project"]["name"]
            assert_equal @project.private, json_response["data"][0]["project"]["private"]
            assert_nil @project.accessory
          end

          test "excludes discarded project memberships" do
            create(:project_membership, project: @project, organization_membership: @org_member, discarded_at: 5.minutes.ago)

            sign_in create(:organization_membership, organization: @organization).user
            get organization_member_project_memberships_path(@organization.slug, @org_member.username)

            assert_response :ok
            assert_response_gen_schema
            expected = { "data" => [] }
            assert_equal expected, json_response
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            get organization_member_project_memberships_path(@organization.slug, @org_member.username)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_member_project_memberships_path(@organization.slug, @org_member.username)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
