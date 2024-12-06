# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class ViewerDisplayPreferencesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @project = create(:project, organization: @organization)
        end

        context "#update" do
          test "updates reactions for project member" do
            member = create(:organization_membership, :member, organization: @organization)
            @project.project_memberships.create!(organization_membership: member)

            sign_in member.user
            put organization_project_viewer_display_preferences_path(@organization.slug, @project.public_id),
              params: { display_reactions: false, display_attachments: true, display_comments: true, display_resolved: true },
              as: :json

            assert_response :ok
            assert_response_gen_schema
            assert_equal false, json_response.dig("viewer_display_preferences", "display_reactions")
            assert_equal true, json_response.dig("viewer_display_preferences", "display_attachments")
            assert_equal true, json_response.dig("viewer_display_preferences", "display_comments")
            assert_equal true, json_response.dig("viewer_display_preferences", "display_resolved")

            preference = @project.display_preferences.find_by(organization_membership: member)
            assert_equal false, preference.display_reactions
            assert_equal true, preference.display_attachments
            assert_equal true, preference.display_comments
            assert_equal true, preference.display_resolved
          end

          test "updates attachments for non member" do
            member = create(:organization_membership, :member, organization: @organization)
            preference = @project.display_preferences.create!(organization_membership: member, display_attachments: false, display_comments: false, display_reactions: false, display_resolved: true)

            sign_in member.user
            put organization_project_viewer_display_preferences_path(@organization.slug, @project.public_id),
              params: { display_attachments: true, display_comments: false, display_reactions: false, display_resolved: true },
              as: :json

            assert_response :ok
            assert_response_gen_schema
            assert_equal false, json_response.dig("viewer_display_preferences", "display_reactions")
            assert_equal true, json_response.dig("viewer_display_preferences", "display_attachments")
            assert_equal false, json_response.dig("viewer_display_preferences", "display_comments")
            assert_equal true, json_response.dig("viewer_display_preferences", "display_resolved")

            assert_equal false, preference.reload.display_reactions
            assert_equal true, preference.display_attachments
            assert_equal false, preference.display_comments
            assert_equal true, preference.display_resolved
          end

          test "returns 403 for a random user" do
            rando = create(:user)

            sign_in rando
            put organization_project_viewer_display_preferences_path(@organization.slug, @project.public_id),
              params: { display_attachments: true, display_comments: true, display_reactions: false, display_resolved: true },
              as: :json

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            put organization_project_viewer_display_preferences_path(@organization.slug, @project.public_id),
              params: { display_attachments: true, display_comments: true, display_reactions: false, display_resolved: true },
              as: :json

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          test "destroys display preferences for project member" do
            member = create(:organization_membership, :member, organization: @organization)
            @project.project_memberships.create!(organization_membership: member)
            @project.display_preferences.create!(organization_membership: member, display_attachments: false, display_comments: false, display_reactions: false, display_resolved: true)

            sign_in member.user

            assert_difference -> { ProjectDisplayPreference.count }, -1 do
              delete organization_project_viewer_display_preferences_path(@organization.slug, @project.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_nil json_response.dig("viewer_display_preferences")
          end

          test "destroys display preferences for non member" do
            member = create(:organization_membership, :member, organization: @organization)
            @project.display_preferences.create!(organization_membership: member, display_attachments: false, display_comments: false, display_reactions: false, display_resolved: true)

            sign_in member.user

            assert_difference -> { ProjectDisplayPreference.count }, -1 do
              delete organization_project_viewer_display_preferences_path(@organization.slug, @project.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_nil json_response.dig("viewer_display_preferences")
          end

          test "noops when there are no display preferences" do
            member = create(:organization_membership, :member, organization: @organization)

            sign_in member.user

            assert_difference -> { ProjectDisplayPreference.count }, 0 do
              delete organization_project_viewer_display_preferences_path(@organization.slug, @project.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_nil json_response.dig("viewer_display_preferences")
          end

          test "returns 403 for a random user" do
            rando = create(:user)

            sign_in rando
            delete organization_project_viewer_display_preferences_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_project_viewer_display_preferences_path(@organization.slug, @project.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
