# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Projects
      class MembershipsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @project = create(:project, organization: @organization)
        end

        context "#create" do
          test "org member can add self" do
            sign_in @user

            assert_query_count 29 do
              post organization_project_project_memberships_path(@organization.slug, @project.public_id),
                params: { user_id: @user.public_id }
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal @project.public_id, json_response.dig("project", "id")
            assert json_response.dig("project", "viewer_has_subscribed")
          end

          test "project member can add another member" do
            other_member = create(:organization_membership, organization: @organization)

            sign_in @user
            post organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: other_member.user.public_id }

            assert_response :created
            assert_response_gen_schema
            assert_equal @project.public_id, json_response.dig("project", "id")
            assert other_member.reload.kept_project_memberships.exists?(project: @project)
            assert other_member.user.subscriptions.exists?(subscribable: @project)
          end

          test "prevents duplicate memberships" do
            create(:project_membership, project: @project, organization_membership: @member)

            sign_in @user
            assert_no_difference -> { @project.project_memberships.count } do
              post organization_project_project_memberships_path(@organization.slug, @project.public_id),
                params: { user_id: @user.public_id }
            end
          end

          test "allows membership in project that has discarded membership" do
            project_membership = create(:project_membership, project: @project, organization_membership: @member, discarded_at: 5.minutes.ago)

            sign_in @user
            post organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_not_predicate project_membership.reload, :discarded?
          end

          test "doesn't consider discarded memberships in order" do
            other_project = create(:project, organization: @organization)
            project_membership = @project.project_memberships.create!(organization_membership: @member)
            other_project_membership = other_project.project_memberships.create!(organization_membership: @member)

            assert_equal 0, project_membership.reload.position
            assert_equal 1, other_project_membership.reload.position

            project_membership.discard

            assert_equal 0, other_project_membership.reload.position
            assert_equal 1, project_membership.reload.position

            sign_in @user
            post organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_response :created
            assert_response_gen_schema
            assert_equal 0, other_project_membership.reload.position
            assert_equal 1, json_response.dig("position")
          end

          test "does not work for a private project you don't have access to" do
            @project = create(:project, organization: @organization, private: true)
            sign_in @user

            post organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_response :forbidden
            assert_equal 0, @project.project_memberships.count
          end

          test "viewers can add members to projects" do
            viewer_member = create(:organization_membership, :viewer, organization: @organization)
            @project.add_member!(viewer_member)

            sign_in viewer_member.user
            post organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_response :created
            assert_response_gen_schema
          end

          test "guest can't add members" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in guest_member.user
            post organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }
            assert_response :unauthorized
          end
        end

        context "#destroy" do
          test "project member can remove self" do
            project_membership = @project.project_memberships.create!(organization_membership: @member)
            sign_in @user

            assert_query_count 25 do
              delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
                params: { user_id: @user.public_id }
            end

            assert_response :ok
            assert_response_gen_schema

            assert_predicate project_membership.reload, :discarded?
          end

          test "project member can remove another member" do
            project_membership = create(:project_membership, project: @project)

            sign_in @user
            delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: project_membership.user.public_id }

            assert_response :ok
            assert_response_gen_schema

            assert project_membership.reload, :discarded?
          end

          test "project member can remove a deactivated member" do
            project_membership = create(:project_membership, project: @project)
            project_membership.organization_membership.discard

            sign_in @user
            delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: project_membership.user.public_id }

            assert_response :ok
            assert_response_gen_schema

            assert project_membership.reload, :discarded?
          end

          test "works for a private project you are a member of" do
            @project = create(:project, organization: @organization, private: true)
            project_membership = @project.project_memberships.create!(organization_membership: @member)
            sign_in @user

            delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_response :ok
            assert_response_gen_schema

            assert_predicate project_membership.reload, :discarded?
          end

          test "does not work for a private project you aren't a member of" do
            @project = create(:project, organization: @organization, private: true)
            sign_in @user

            delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_response :forbidden
          end

          test "viewers can remove members from projects" do
            viewer_member = create(:organization_membership, :viewer, organization: @organization)
            @project.add_member!(viewer_member)

            sign_in viewer_member.user
            delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_response :ok
            assert_response_gen_schema
          end

          test "guest can't remove members" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in guest_member.user
            delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_response :forbidden
          end

          test "for chat project, destroys associated message thread membership" do
            message_thread = create(:message_thread, owner: @member)
            @project.update!(message_thread: message_thread)
            @project.add_member!(@member)

            assert message_thread.member?(@user)

            sign_in @user
            delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }

            assert_response :ok
            assert_response_gen_schema
            assert_not message_thread.reload.member?(@user)
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_project_project_memberships_path(@organization.slug, @project.public_id),
              params: { user_id: @user.public_id }
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
