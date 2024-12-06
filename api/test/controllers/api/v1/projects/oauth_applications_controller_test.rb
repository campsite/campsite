# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class OauthApplicationsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership, :admin)
          @non_member = create(:organization_membership)
          @organization = @member.organization
          @project = create(:project, organization: @organization)
          @oauth_application = create(:oauth_application, owner: @organization)
        end

        context "#index" do
          setup do
            @path = organization_project_oauth_applications_path(@organization.slug, @project.public_id)
          end

          test "returns a list of oauth applications" do
            @project.add_oauth_application!(@oauth_application)

            sign_in @member.user
            get @path

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, json_response.size
            assert_nil json_response[0]["secret"]
          end

          test "does not work for a project you do not have access to" do
            sign_in @non_member.user
            get @path
            assert_response :forbidden
          end

          test "does not work for guests" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in guest_member.user
            get @path

            assert_response :forbidden
          end

          test "does not return discarded oauth applications" do
            @oauth_application.discard

            sign_in @member.user
            get @path

            assert_response :ok
            assert_response_gen_schema
            assert_equal 0, json_response.size
          end

          test "returns 401 for an unauthenticated user" do
            get @path
            assert_response :unauthorized
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get @path
            assert_response :forbidden
          end
        end

        context "#create" do
          setup do
            @path = organization_project_oauth_applications_path(@organization.slug, @project.public_id)
          end

          test "adds an oauth application to the project" do
            sign_in @member.user

            assert_difference -> { @project.oauth_applications.count }, 1 do
              post @path, params: { oauth_application_id: @oauth_application.public_id }
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal @project.project_memberships.last.public_id, json_response["id"]
          end

          test "does not add the same oauth application twice" do
            sign_in @member.user

            @project.add_oauth_application!(@oauth_application)

            assert_no_difference -> { @project.oauth_applications.count } do
              post @path, params: { oauth_application_id: @oauth_application.public_id }
            end
          end

          test "adds the oauth application to the project's message thread if one exists" do
            project = create(:project, :chat_project, organization: @organization)

            sign_in @member.user

            post organization_project_oauth_applications_path(@organization.slug, project.public_id),
              params: { oauth_application_id: @oauth_application.public_id }

            assert_response :ok
            assert_response_gen_schema
            assert_equal project.message_thread.oauth_applications, [@oauth_application]
          end

          test "does not work for an oauth application that does not belong to the organization" do
            oauth_application = create(:oauth_application, owner: create(:organization))

            sign_in @member.user
            post @path, params: { oauth_application_id: oauth_application.public_id }

            assert_response :not_found
          end

          test "does not work for a project you do not have access to" do
            sign_in @non_member.user
            post @path
            assert_response :forbidden
          end

          test "guests cannot add oauth applications to projects" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in guest_member.user
            post @path, params: { oauth_application_id: @oauth_application.public_id }

            assert_response :forbidden
          end

          test "returns 401 for an unauthenticated user" do
            post @path
            assert_response :unauthorized
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post @path
            assert_response :forbidden
          end
        end

        context "#destroy" do
          setup do
            @path = organization_project_oauth_application_path(@organization.slug, @project.public_id, @oauth_application.public_id)
          end

          test "removes an oauth application from a project" do
            sign_in @member.user

            @project.add_oauth_application!(@oauth_application)

            assert_difference -> { @project.reload.kept_oauth_applications.count }, -1 do
              delete @path
            end

            assert_response :no_content
            assert_equal 0, @project.reload.kept_oauth_applications.count
          end

          test "removes the oauth application from the project's message thread if one exists" do
            project = create(:project, :chat_project, organization: @organization)
            project.add_oauth_application!(@oauth_application, event_actor: @member)

            sign_in @member.user
            delete organization_project_oauth_application_path(@organization.slug, project.public_id, @oauth_application.public_id)

            assert_response :no_content
            assert_equal 0, project.reload.kept_oauth_applications.count
            assert_equal 0, project.message_thread.oauth_applications.count
          end

          test "does not work for a project you do not have access to" do
            sign_in @non_member.user
            delete @path
            assert_response :forbidden
          end

          test "does not work for guests" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in guest_member.user
            delete @path

            assert_response :forbidden
          end

          test "returns 401 for an unauthenticated user" do
            delete @path
            assert_response :unauthorized
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            delete @path
            assert_response :forbidden
          end
        end
      end
    end
  end
end
