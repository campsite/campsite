# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Sync
      class ProjectsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
        end

        context "#index" do
          test "returns projects the viewer has access to" do
            project1 = create(:project, organization: @organization)
            project2 = create(:project, :general, organization: @organization)
            project3 = create(:project, organization: @organization)
            project4 = create(:project, :archived, organization: @organization)
            project5 = create(:project, organization: @organization, private: true)
            create(:project_membership, organization_membership: @member, project: project5)
            project6 = create(:project, organization: @organization, private: true)

            sign_in @member.user
            get organization_sync_projects_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema
            assert_includes json_response.pluck("id"), project1.public_id
            assert_includes json_response.pluck("id"), project2.public_id
            assert_includes json_response.pluck("id"), project3.public_id
            assert_includes json_response.pluck("id"), project4.public_id
            assert json_response.select { |project| project["id"] == project4.public_id }.first["archived"]
            assert_includes json_response.pluck("id"), project5.public_id
            assert_not_includes json_response.pluck("id"), project6.public_id
          end

          test "query count" do
            create(:project, organization: @organization)
            create(:project, :general, organization: @organization)
            create(:project, organization: @organization)
            create(:project, :archived, organization: @organization)
            project5 = create(:project, organization: @organization, private: true)
            create(:project_membership, organization_membership: @member, project: project5)
            create(:project, organization: @organization, private: true)

            sign_in @member.user

            assert_query_count 4 do
              get organization_sync_projects_path(@organization.slug)
            end
          end
        end
      end
    end
  end
end
