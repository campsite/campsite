# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class InvitationUrlsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @project = create(:project, organization: @organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
        end

        context "#create" do
          test "resets the org invite token" do
            old_url = @project.invitation_url

            sign_in @user
            post organization_project_invitation_url_path(@organization.slug, @project.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_not_equal old_url, json_response["invitation_url"]
          end

          test "does not work for a private project you don't have access to" do
            project = create(:project, private: true, organization: @organization)

            sign_in @user
            post organization_project_invitation_url_path(@organization.slug, project.public_id)

            assert_response :forbidden
          end

          test "guest can't reset invitation URL" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in guest_member.user
            post organization_project_invitation_url_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_project_invitation_url_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_project_invitation_url_path(@organization.slug, @project.public_id)

            assert_response :unauthorized
          end
        end

        context "#show" do
          test "org member can see invitation URL" do
            sign_in @user

            assert_query_count 4 do
              get organization_project_invitation_url_path(@organization.slug, @project.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal "http://app.campsite.test:3000/guest/#{@project.invite_token}", json_response["invitation_url"]
          end

          test "does not work for a private project you don't have access to" do
            project = create(:project, private: true, organization: @organization)

            sign_in @user
            get organization_project_invitation_url_path(@organization.slug, project.public_id)

            assert_response :forbidden
          end

          test "guest can't see invitation URL" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in guest_member.user
            get organization_project_invitation_url_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            get organization_project_invitation_url_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_project_invitation_url_path(@organization.slug, @project.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
