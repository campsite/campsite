# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class ProjectMembershipsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @organization = create(:organization)
        @org_member = create(:organization_membership, organization: @organization)
        @user = @org_member.user
        @project = create(:project, organization: @organization)
      end

      context "#index" do
        test "works for an org admin" do
          create(:project_membership, project: @project, organization_membership: @org_member)
          create_list(:project_membership, 5, organization_membership: @org_member)

          sign_in @user

          assert_query_count 8 do
            get organization_project_memberships_path(@organization.slug)
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal 0, json_response[0]["position"]
          assert_equal @project.public_id, json_response[0]["project"]["id"]
          assert_equal @project.name, json_response[0]["project"]["name"]
          assert_equal @project.private, json_response[0]["project"]["private"]
          assert_nil @project.accessory
        end

        test "excludes discarded project memberships" do
          create(:project_membership, project: @project, organization_membership: @org_member, discarded_at: 5.minutes.ago)

          sign_in @user
          get organization_project_memberships_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_equal [], json_response
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_project_memberships_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_project_memberships_path(@organization.slug)
          assert_response :unauthorized
        end
      end
    end
  end
end
