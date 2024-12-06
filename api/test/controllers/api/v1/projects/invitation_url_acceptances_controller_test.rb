# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class InvitationUrlAcceptancesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
          @project = create(:project)
          @organization = @project.organization
        end

        context "#create" do
          test "accepts the invitation" do
            admin = create(:organization_membership, :admin, organization: @organization)

            sign_in @user
            post organization_project_invitation_url_acceptances_path(@organization.slug, @project.public_id, params: { token: @project.invite_token })

            assert_response :no_content
            assert @project.member_users.include?(@user)

            organization_membership = @organization.kept_memberships.find_by!(user: @user)
            assert_enqueued_email_with(OrganizationMailer, :join_via_guest_link, args: [organization_membership, @project, admin.user])

            project_membership = @project.kept_project_memberships.find_by(organization_membership_id: organization_membership.id)
            event = project_membership.events.created_action.first!
            assert_no_difference -> { Notification.count } do
              event.process!
            end
          end

          test "existing member joins the project and retains their role" do
            member = create(:organization_membership, :member, organization: @organization)

            sign_in member.user
            post organization_project_invitation_url_acceptances_path(@organization.slug, @project.public_id, params: { token: @project.invite_token })

            assert_response :no_content
            assert @project.member_users.include?(member.user)
            assert_equal member.reload.role_name, Role::MEMBER_NAME
          end

          test "return 401 for an unauthenticated user" do
            post organization_project_invitation_url_acceptances_path(@organization.slug, @project.public_id, params: { token: @project.invite_token })
            assert_response :unauthorized
          end

          test "return 404 for a token that doesn't exist" do
            sign_in @user
            post organization_project_invitation_url_acceptances_path(@organization.slug, @project.public_id, params: { token: "doesntexist" })
            assert_response :not_found
          end
        end
      end
    end
  end
end
