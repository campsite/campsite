# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Projects
      class ViewsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @project = create(:project, organization: @organization)
        end

        context "#create" do
          test "creates a new ProjectView" do
            Timecop.freeze do
              sign_in @user

              assert_query_count 12 do
                post organization_project_views_path(@organization.slug, @project.public_id)
              end

              assert_response :created
              project_view = @project.views.find_by!(organization_membership: @member)
              assert_in_delta Time.current, project_view.last_viewed_at, 2.seconds
            end
          end

          test "updates an existing ProjectView" do
            Timecop.freeze do
              project_view = create(:project_view, project: @project, organization_membership: @member, last_viewed_at: 1.day.ago)

              sign_in @user
              post organization_project_views_path(@organization.slug, @project.public_id)

              assert_response :created
              assert_response_gen_schema

              assert_in_delta Time.current, project_view.reload.last_viewed_at, 2.seconds
            end
          end

          test "returns 403 for private project you don't have access to" do
            project = create(:project, organization: @organization, private: true)

            sign_in @user
            post organization_project_views_path(@organization.slug, project.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_project_views_path(@organization.slug, @project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_project_views_path(@organization.slug, @project.public_id)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
