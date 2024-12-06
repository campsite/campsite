# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class ProjectsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user_member = create(:organization_membership)
        @user = @user_member.user
        @organization = @user_member.organization
      end

      context "#index" do
        before do
          @active_project = create(:project, organization: @organization, name: "First Deterministic No Flakes")
          @active_project.update!(last_activity_at: 1.minute.ago)
          @general_project = create(:project, :general, organization: @organization, name: "General Deterministic No Flakes")
          @general_project.update!(last_activity_at: 1.day.ago)
          @stale_project = create(:project, organization: @organization, name: "Second Deterministic No Flakes")
          @stale_project.update!(last_activity_at: 1.month.ago)
          @archived_project = create(:project, :archived, organization: @organization, name: "Archived Deterministic No Flakes")
        end

        test "returns paginated unarchived projects for a org member" do
          sign_in @user
          get organization_projects_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [@active_project.public_id, @general_project.public_id, @stale_project.public_id], json_response["data"].pluck("id")
        end

        test "returns paginated archived projects if requested" do
          sign_in @user
          get organization_projects_path(@organization.slug), params: { filter: "archived" }

          assert_response :ok
          assert_response_gen_schema

          assert_equal [@archived_project.public_id], json_response["data"].pluck("id")
        end

        test "includes private projects the user is a member of" do
          project = create(:project, organization: @organization, private: true)
          create(:project_membership, organization_membership: @user_member, project: project)

          sign_in @user
          get organization_projects_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_includes json_response["data"].pluck("id"), project.public_id
        end

        test "does not include private projects the user does not have access to" do
          project = create(:project, organization: @organization, private: true)

          sign_in @user
          get organization_projects_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_not_includes json_response["data"].pluck("id"), project.public_id
        end

        test "returns projects matching the given query" do
          create_list(:post, 5)

          sign_in @user
          get organization_projects_path(@organization.slug), params: { q: @active_project.name }

          assert_response :ok
          assert_response_gen_schema
          assert_equal 1, json_response["data"].count
          assert_equal @active_project.public_id, json_response["data"][0]["id"]
          assert_equal @active_project.name, json_response["data"][0]["name"]
        end

        test "doesn't use excessive number of queries" do
          integration = create(:integration, owner: @organization, provider: :slack)
          channel = create(:integration_channel, integration: integration)
          @active_project.update!(slack_channel_id: channel.provider_channel_id)

          sign_in @user

          assert_query_count 9 do
            get organization_projects_path(@organization.slug)
          end

          assert_response :ok
        end

        test "guests only see projects they belong to" do
          guest_member = create(:organization_membership, :guest, organization: @organization)
          @active_project.add_member!(guest_member)
          private_project = create(:project, organization: @organization, private: true)
          private_project.add_member!(guest_member)

          sign_in guest_member.user
          get organization_projects_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_equal 2, json_response["data"].count
          assert_includes json_response["data"].pluck("id"), @active_project.public_id
          assert_includes json_response["data"].pluck("id"), private_project.public_id
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_projects_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_projects_path(@organization.slug)
          assert_response :unauthorized
        end
      end

      context "#create" do
        test "creates the project for an org admin and adds them as a member" do
          assert @organization.admin?(@user)

          sign_in @user

          assert_difference -> { Project.count } do
            post organization_projects_path(@organization.slug),
              params: { name: "big-project", description: "Best big project" }

            assert_response :created
            assert_response_gen_schema
            assert_equal "big-project", json_response["name"]
            assert_equal "Best big project", json_response["description"]
            assert_not_predicate json_response["message_thread_id"], :present?
            assert_not json_response["private"]
            project = @organization.projects.last
            assert_equal @user_member, project.creator
            assert project.subscribers.include?(@user)
            assert_predicate project.invite_token, :present?
            assert_enqueued_sidekiq_job(CreateProjectCallRoomJob, args: [project.id])
          end
        end

        test "creates the project for a org member and adds them as a member" do
          org_member = create(:organization_membership, :member, organization: @organization)

          sign_in org_member.user

          assert_difference -> { Project.count } do
            post organization_projects_path(@organization.slug),
              params: { name: "hip-project", description: "Best hip project" }

            assert_response :created
            assert_response_gen_schema
            assert_equal "hip-project", json_response["name"]
            assert_equal "Best hip project", json_response["description"]
            project = @organization.projects.last
            assert_equal org_member, project.creator
            assert project.subscribers.include?(org_member.user)
          end
        end

        test "doesn't allow a viewer to create a project" do
          viewer = create(:organization_membership, :viewer, organization: @organization)

          sign_in viewer.user

          assert_no_difference -> { Project.count } do
            post organization_projects_path(@organization.slug),
              params: { name: "hip-project", description: "Best hip project" }

            assert_response :forbidden
          end
        end

        test "creates a private project" do
          other_member = create(:organization_membership, organization: @organization)

          sign_in @user

          assert_difference -> { Project.count } do
            post organization_projects_path(@organization.slug),
              params: { name: "big-project", description: "Best big project", private: true, member_user_ids: [other_member.user.public_id] }

            assert_response :created
            assert_response_gen_schema
            assert_equal "big-project", json_response["name"]
            assert_equal "Best big project", json_response["description"]
            assert json_response["private"]
            project = @organization.projects.last
            assert project.kept_project_memberships.exists?(organization_membership: @user_member)
            assert project.kept_project_memberships.exists?(organization_membership: other_member)
            assert project.subscribers.include?(@user)
            assert project.subscribers.include?(other_member.user)
          end
        end

        test "creates a non-private project with project memberships" do
          other_member = create(:organization_membership, organization: @organization)

          sign_in @user

          assert_difference -> { Project.count } do
            post organization_projects_path(@organization.slug),
              params: { name: "big-project", description: "Best big project", member_user_ids: [other_member.user.public_id] }

            assert_response :created
            assert_response_gen_schema
            assert_equal "big-project", json_response["name"]
            assert_equal "Best big project", json_response["description"]
            assert_not json_response["private"]
            project = @organization.projects.last
            assert_equal @user_member, project.creator
            assert project.kept_project_memberships.exists?(organization_membership: @user_member)
            assert project.kept_project_memberships.exists?(organization_membership: other_member)
            assert project.subscribers.include?(@user)
            assert project.subscribers.include?(other_member.user)
          end
        end

        test "when add_everyone param is present, creates memberships for every active, non-guest org member" do
          create_list(:organization_membership, 6, organization: @organization)
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in @user

          assert_difference -> { Project.count } do
            assert_query_count 103 do
              post organization_projects_path(@organization.slug),
                params: { name: "big-project", description: "Best big project", add_everyone: true }
            end
          end

          assert_response :created
          assert_response_gen_schema
          project = Project.find_by(public_id: json_response["id"])
          assert_equal 7, project.kept_project_memberships.count
          assert_equal 7, project.subscribers.count
          assert project.kept_project_memberships.exists?(organization_membership: @user_member)
          assert_not project.kept_project_memberships.exists?(organization_membership: guest_member)
        end

        test "return 422 if trying to add_everyone to a private project" do
          sign_in @user

          assert_no_difference -> { Project.count } do
            post organization_projects_path(@organization.slug),
              params: { name: "big-project", description: "Best big project", add_everyone: true, private: true }
          end

          assert_response :unprocessable_entity
        end

        test "creates a chat project" do
          sign_in @user

          assert_difference -> { Project.count } do
            assert_query_count 39 do
              post organization_projects_path(@organization.slug),
                params: { name: "big-project", description: "Best big project", chat_format: "true" }
            end
          end

          assert_response :created
          assert_response_gen_schema
          project = @organization.projects.last
          message_thread = project.message_thread
          assert_equal message_thread.public_id, json_response["message_thread_id"]
          assert_equal project.name, message_thread.title
          assert_predicate message_thread, :group?
          assert_includes message_thread.kept_organization_memberships, @user_member
          assert_enqueued_sidekiq_job(CreateMessageThreadCallRoomJob, args: [message_thread.id])
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          post organization_projects_path(@organization.slug), params: { name: "new-name" }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organization_projects_path(@organization.slug), params: { name: "new-name" }
          assert_response :unauthorized
        end

        test "it joins a slack channel" do
          Project.any_instance.stubs(:slack_token).returns("token")
          Slack::Web::Client.any_instance.expects(:conversations_join).with(channel: "channel_id")

          sign_in @user

          post organization_projects_path(@organization.slug),
            params: {
              name: "big-project",
              description: "Best big project",
              slack_channel_id: "channel_id",
              slack_channel_is_private: false,
            }

          assert_response :created
          assert_response_gen_schema
          assert_equal "channel_id", json_response["slack_channel_id"]
        end

        test "it does not join a slack channel when private" do
          Project.any_instance.stubs(:slack_token).returns("token")
          Slack::Web::Client.any_instance.expects(:conversations_join).with(channel: "channel_id").never

          sign_in @user

          post organization_projects_path(@organization.slug),
            params: {
              name: "big-project",
              description: "Best big project",
              slack_channel_id: "channel_id",
              slack_channel_is_private: true,
            },
            as: :json

          assert_response :created
          assert_response_gen_schema
          assert_equal "channel_id", json_response["slack_channel_id"]
        end
      end

      context "#show" do
        before do
          @project = create(:project, organization: @organization)
        end

        test "returns the project for an admin" do
          assert @organization.admin?(@user)

          sign_in @user
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_not json_response["private"]
        end

        test "returns the project for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["viewer_can_destroy"]
          assert_equal true, json_response["viewer_can_archive"]
          assert_equal true, json_response["viewer_can_unarchive"]
          assert_equal true, json_response["viewer_can_update"]
        end

        test "returns the project for a viewer" do
          viewer_member = create(:organization_membership, :viewer, organization: @organization)

          sign_in viewer_member.user
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal false, json_response["viewer_can_destroy"]
          assert_equal false, json_response["viewer_can_archive"]
          assert_equal false, json_response["viewer_can_unarchive"]
          assert_equal true, json_response["viewer_can_update"]
        end

        test "includes the project's Slack channel" do
          integration = create(:integration, owner: @organization, provider: :slack)
          channel = create(:integration_channel, integration: integration)
          @project.update!(slack_channel_id: channel.provider_channel_id)

          sign_in @user
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal channel.provider_channel_id, json_response.dig("slack_channel", "id")
          assert_equal channel.name, json_response.dig("slack_channel", "name")
          assert_not json_response.dig("slack_channel", "is_private")
        end

        test "returns whether the project is private" do
          create(:project_membership, project: @project, organization_membership: @user_member)
          @project.update!(private: true)

          sign_in @user
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert json_response["private"]
        end

        test "includes whether the viewer is project member" do
          create(:project_membership, project: @project, organization_membership: @user_member)

          sign_in @user
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["viewer_is_member"]
        end

        test "includes when project membership has been discarded" do
          create(:project_membership, project: @project, organization_membership: @user_member, discarded_at: 5.minutes.ago)

          sign_in @user
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal false, json_response["viewer_is_member"]
        end

        test "guest can see project they belong to" do
          guest_member = create(:organization_membership, :guest, organization: @organization)
          @project.add_member!(guest_member)

          sign_in guest_member.user
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal false, json_response["viewer_can_destroy"]
          assert_equal false, json_response["viewer_can_archive"]
          assert_equal false, json_response["viewer_can_unarchive"]
          assert_equal false, json_response["viewer_can_update"]
        end

        test "guest can see private project they belong to" do
          guest_member = create(:organization_membership, :guest, organization: @organization)
          @project.update!(private: true)
          @project.add_member!(guest_member)

          sign_in guest_member.user
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_response_gen_schema
        end

        test "creates onboarding posts" do
          assert @organization.admin?(@user)

          sign_in @user

          assert_difference -> { Post.count }, 1 do
            post organization_projects_path(@organization.slug),
              params: { name: "big-project", description: "Best big project", onboarding: true },
              as: :json

            assert_response :created
            assert_response_gen_schema
          end
        end

        test "does not create onboarding posts by default" do
          assert @organization.admin?(@user)

          sign_in @user

          assert_difference -> { Post.count }, 0 do
            post organization_projects_path(@organization.slug),
              params: { name: "big-project", description: "Best big project" }

            assert_response :created
            assert_response_gen_schema
          end
        end

        test "guest can't see project they don't belong to" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          get organization_project_path(@organization.slug, @project.public_id)

          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_project_path(@organization.slug, @project.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_project_path(@organization.slug, @project.public_id)
          assert_response :unauthorized
        end
      end

      context "#update" do
        before do
          @project = create(:project, organization: @organization, name: "Name", description: "Description")
        end

        test "updates the project for an org admin" do
          assert @organization.admin?(@user)

          sign_in @user
          put organization_project_path(@organization.slug, @project.public_id),
            params: { name: "big-project", description: "Best big project" }

          assert_response :ok
          assert_response_gen_schema

          assert_equal "big-project", json_response["name"]
          assert_equal "Best big project", json_response["description"]
        end

        test "updates the project default status for an org admin" do
          assert @organization.admin?(@user)

          sign_in @user
          put organization_project_path(@organization.slug, @project.public_id), params: { is_default: true }, as: :json

          assert_response :ok
          assert_response_gen_schema

          assert @project.reload.is_default

          put organization_project_path(@organization.slug, @project.public_id), params: { is_default: false }, as: :json

          assert_response :ok
          assert_response_gen_schema

          assert_not @project.reload.is_default
        end

        test "does not update is_default if you're not an admin" do
          org_member = create(:organization_membership, :member, organization: @organization).user
          sign_in org_member

          put organization_project_path(@organization.slug, @project.public_id), params: { is_default: true }, as: :json
          assert_response :ok
          assert_response_gen_schema

          assert_not @project.is_default
        end

        test "turn project private to public" do
          @project.update!(private: true)
          create(:project_membership, project: @project, organization_membership: @user_member)

          sign_in @user
          put organization_project_path(@organization.slug, @project.public_id), params: { name: "initially-private-project", private: false }, as: :json
          assert_response :ok
          assert_response_gen_schema
          assert_not json_response["private"]
        end

        test "turn project public to private" do
          create(:project_membership, project: @project, organization_membership: @user_member)
          sign_in @user
          put organization_project_path(@organization.slug, @project.public_id), params: { private: true }, as: :json
          assert_response :ok
          assert_response_gen_schema

          assert json_response["private"]
        end

        test "default project cannot be private" do
          @project.update!(is_default: true)

          sign_in @user
          put organization_project_path(@organization.slug, @project.public_id), params: { private: true }, as: :json

          assert_response :unprocessable_entity
        end

        test "updates the project for an org member" do
          org_member = create(:organization_membership, :member, organization: @organization).user

          sign_in org_member
          put organization_project_path(@organization.slug, @project.public_id),
            params: { name: "big-project", description: "Best big project" }

          assert_response :ok
          assert_response_gen_schema

          assert_equal "big-project", json_response["name"]
          assert_equal "Best big project", json_response["description"]
        end

        test "keeps the description when not updated" do
          org_member = create(:organization_membership, :member, organization: @organization).user

          assert_equal "Name", @project.name
          assert_equal "Description", @project.description

          sign_in org_member
          put organization_project_path(@organization.slug, @project.public_id),
            params: { name: "big-project" }

          assert_response :ok
          assert_response_gen_schema

          assert_equal "big-project", json_response["name"]
          assert_equal "Description", json_response["description"]
          assert_equal "big-project", @project.reload.name
          assert_equal "Description", @project.description
        end

        test "viewers can update projects" do
          viewer_member = create(:organization_membership, :viewer, organization: @organization)

          sign_in viewer_member.user
          put organization_project_path(@organization.slug, @project.public_id),
            params: { name: "big-project", description: "Best big project" }

          assert_response :ok
          assert_response_gen_schema
        end

        test "syncs name change to message thread" do
          thread = create(:message_thread)
          @project.update!(message_thread: thread)

          sign_in @user
          put organization_project_path(@organization.slug, @project.public_id),
            params: { name: "big-project", description: "Best big project" }

          assert_equal @project.reload.name, thread.reload.title
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          put organization_project_path(@organization.slug, @project.public_id), params: { name: "new-name" }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_project_path(@organization.slug, @project.public_id), params: { name: "new-name" }
          assert_response :unauthorized
        end
      end

      context "#destroy" do
        before do
          @project = create(:project, organization: @organization)
        end

        test "destroys the project for an org admin" do
          assert @organization.admin?(@user)

          sign_in @user
          delete organization_project_path(@organization.slug, @project.public_id)

          assert_response :no_content
          assert_nil Project.find_by(id: @project.id)
        end

        test "cannot destroy the general project for an org member" do
          @project.update!(is_general: true)

          org_member = create(:organization_membership, :member, organization: @organization).user

          sign_in org_member
          delete organization_project_path(@organization.slug, @project.public_id)

          assert_response :forbidden
          assert_not_nil Project.find_by(id: @project.id)
        end

        test "destroys the project for an org member" do
          org_member = create(:organization_membership, :member, organization: @organization).user

          sign_in org_member
          delete organization_project_path(@organization.slug, @project.public_id)

          assert_response :no_content
          assert_nil Project.find_by(id: @project.id)
        end

        test "viewer cannot destroy a project" do
          viewer_member = create(:organization_membership, :viewer, organization: @organization)

          sign_in viewer_member.user
          delete organization_project_path(@organization.slug, @project.public_id)

          assert_response :forbidden
          assert Project.find_by(id: @project.id)
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          delete organization_project_path(@organization.slug, @project.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_project_path(@organization.slug, @project.public_id)
          assert_response :unauthorized
        end
      end

      context "#archive" do
        before do
          @project = create(:project, organization: @organization)
        end

        test "archives the project for an org admin" do
          sign_in @user
          put organization_archive_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_predicate @project.reload, :archived?
        end

        test "cannot archive the general project for an org admin" do
          @project.update!(is_general: true)

          sign_in @user
          put organization_archive_project_path(@organization.slug, @project.public_id)

          assert_response :forbidden
          assert_not_predicate @project.reload, :archived?
        end

        test "archives the project for an org member" do
          org_member = create(:organization_membership, :member, organization: @organization).user

          sign_in org_member
          put organization_archive_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_predicate @project.reload, :archived?
        end

        test "doesn't allow viewer to archive a project" do
          viewer_member = create(:organization_membership, :viewer, organization: @organization)

          sign_in viewer_member.user
          put organization_archive_project_path(@organization.slug, @project.public_id)

          assert_response :forbidden
          assert_not_predicate @project.reload, :archived?
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          put organization_archive_project_path(@organization.slug, @project.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_archive_project_path(@organization.slug, @project.public_id)
          assert_response :unauthorized
        end
      end

      context "#unarchive" do
        before do
          @project = create(:project, organization: @organization, archived_at: Time.current, archived_by: @user_member)
        end

        test "unarchives the project for an org admin" do
          sign_in @user
          put organization_unarchive_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_not_predicate @project.reload, :archived?
        end

        test "unarchives the project for an org member" do
          org_member = create(:organization_membership, :member, organization: @organization).user

          sign_in org_member
          put organization_unarchive_project_path(@organization.slug, @project.public_id)

          assert_response :ok
          assert_not_predicate @project.reload, :archived?
        end

        test "doesn't allow a viewer to unarchive a project" do
          viewer_member = create(:organization_membership, :viewer, organization: @organization)

          sign_in viewer_member.user
          put organization_unarchive_project_path(@organization.slug, @project.public_id)

          assert_response :forbidden
          assert_predicate @project.reload, :archived?
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          put organization_unarchive_project_path(@organization.slug, @project.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_unarchive_project_path(@organization.slug, @project.public_id)
          assert_response :unauthorized
        end
      end

      context "#cover_photo_presigned_fields" do
        setup do
          @member = create(:organization_membership, :member, organization: @organization).user
        end

        test "returns presigned fields for an admin" do
          sign_in @user
          get organization_project_cover_photo_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }

          assert_response :ok
          assert_response_gen_schema
        end

        test "returns presigned fields for a member" do
          sign_in @member
          get organization_project_cover_photo_presigned_fields_path(@organization.slug), params: { mime_type: "image/png" }

          assert_response :ok
          assert_response_gen_schema
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          get organization_project_cover_photo_presigned_fields_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_project_cover_photo_presigned_fields_path(@organization.slug)
          assert_response :unauthorized
        end
      end
    end
  end
end
