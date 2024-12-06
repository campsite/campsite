# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module ProjectMemberships
      class ReordersControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @org_member = create(:organization_membership, organization: @organization)
          @user = @org_member.user

          @projects = create_list(:project, 4, organization: @organization)
          @project_memberships = @projects.map do |project|
            create(:project_membership, project: project, organization_membership: @org_member)
          end
        end

        context "#update" do
          test "works for an org admin" do
            sign_in @user

            put organization_project_memberships_reorders_path(@organization.slug, project_memberships: [
              { id: @project_memberships[3].public_id, position: 0 },
              { id: @project_memberships[0].public_id, position: 1 },
              { id: @project_memberships[2].public_id, position: 2 },
              { id: @project_memberships[1].public_id, position: 3 },
            ])

            assert_response :no_content
            assert_equal [@project_memberships[3], @project_memberships[0], @project_memberships[2], @project_memberships[1]], @org_member.reload.kept_project_memberships.order(:position)
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            put organization_project_memberships_reorders_path(@organization.slug, project_memberships: [])
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            put organization_project_memberships_reorders_path(@organization.slug, project_memberships: [])
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
