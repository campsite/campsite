# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class ReadsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @project = create(:project, organization: @organization)
          @view = create(:project_view, project: @project, organization_membership: @member)
        end

        context "#create" do
          test "marks the project as read" do
            last_read = 1.day.ago
            @view.update!(last_viewed_at: last_read, manually_marked_unread_at: last_read + 1)

            sign_in @member.user
            post organization_project_reads_path(@organization.slug, @project.public_id)

            assert_response :created
            assert @view.reload.last_viewed_at > last_read
            assert_nil @view.reload.manually_marked_unread_at
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@member.user.channel_name, "project-marked-read", @project.public_id.to_json])
          end

          test "query count" do
            sign_in @member.user

            assert_query_count 12 do
              post organization_project_reads_path(@organization.slug, @project.public_id)
            end
          end

          test "returns an error for a private project if the user is not a member of the project" do
            @project.update!(private: true)

            other_member = create(:organization_membership, organization: @organization)
            sign_in other_member.user

            post organization_project_reads_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end
        end

        context "#destroy" do
          test "it marks the project as unread" do
            sign_in @member.user
            delete organization_project_reads_path(@organization.slug, @project.public_id)

            assert_response :no_content
            assert_not_nil @view.reload.manually_marked_unread_at
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@member.user.channel_name, "project-marked-unread", @project.public_id.to_json])
          end

          test "query count" do
            sign_in @member.user

            assert_query_count 9 do
              delete organization_project_reads_path(@organization.slug, @project.public_id)
            end
          end

          test "it returns an error if the user is not a member of the project" do
            @project.update!(private: true)

            other_member = create(:organization_membership, organization: @organization)

            sign_in other_member.user
            delete organization_project_reads_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end
        end
      end
    end
  end
end
