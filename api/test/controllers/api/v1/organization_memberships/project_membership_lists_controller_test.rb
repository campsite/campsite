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
        end

        context "#update" do
          test "works for an org admin" do
            project_1 = create(:project, organization: @organization)
            project_2 = create(:project, organization: @organization)
            project_1.add_member!(@org_member)

            sign_in create(:organization_membership, organization: @organization).user

            assert_query_count 42 do
              put organization_member_project_membership_list_path(@organization.slug, @org_member.username, params: {
                add_project_ids: [project_2.public_id],
                remove_project_ids: [project_1.public_id],
              })
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, json_response["data"].length
            assert_equal project_2.public_id, json_response["data"][0]["project"]["id"]
            assert_equal project_2.name, json_response["data"][0]["project"]["name"]
            assert_equal project_2.private, json_response["data"][0]["project"]["private"]
            assert_nil project_2.accessory
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            put organization_member_project_membership_list_path(@organization.slug, @org_member.username, params: {
              add_project_ids: [],
            })
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            put organization_member_project_membership_list_path(@organization.slug, @org_member.username, params: {
              add_project_ids: [],
            })
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
