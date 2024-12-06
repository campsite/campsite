# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class OrganizationInvitationsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @organization = create(:organization, :pro)
        @user = create(:organization_membership, organization: @organization).user
      end

      context "#index" do
        setup do
          create(:organization_invitation, organization: @organization)
          create(:organization_invitation, organization: @organization)
        end

        test "returns org invitations for admin" do
          sign_in @user

          get organization_invitations_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal 2, json_response["data"].length
          expected_ids = @organization.invitations.pluck(:public_id).sort
          assert_equal expected_ids, json_response["data"].pluck("id").sort
        end

        test "returns org invitation for a member" do
          membership = create(:organization_membership, :member, organization: @organization)

          sign_in membership.user
          get organization_invitations_path(@organization.slug)

          assert_equal 2, json_response["data"].length
          expected_ids = @organization.invitations.pluck(:public_id).sort
          assert_equal expected_ids, json_response["data"].pluck("id").sort
        end

        test "returns search results" do
          invite1 = create(:organization_invitation, organization: @organization, email: "foo@bar.com")
          invite2 = create(:organization_invitation, organization: @organization, email: "bar@foo.com")
          membership = create(:organization_membership, :member, organization: @organization)

          sign_in membership.user
          get organization_invitations_path(@organization.slug), params: { q: "foo" }

          assert_equal 2, json_response["data"].length
          assert_equal [invite1, invite2].pluck(:public_id).sort, json_response["data"].pluck("id").sort
        end

        test "guests can't list invitations" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          get organization_invitations_path(@organization.slug)

          assert_response :forbidden
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_invitations_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_invitations_path(@organization.slug)
          assert_response :unauthorized
        end
      end

      context "#create" do
        setup do
          @invitations = [{ email: "ron@example.com", role: "admin" }, { email: "hermoine@example.com", role: "member" }]
        end

        test "creates multiple org invitations for an admin" do
          sign_in @user

          assert_difference -> { OrganizationInvitation.count }, 2 do
            post organization_invitations_path(@organization.slug), params: { invitations: @invitations }

            assert_response :created
            assert_response_gen_schema
            assert_equal "admin", json_response[0]["role"]
            assert_equal "ron@example.com", json_response[0]["email"]
            assert_equal "member", json_response[1]["role"]
            assert_equal "hermoine@example.com", json_response[1]["email"]
          end
        end

        test "creates multiple org inviations for a member" do
          membership = create(:organization_membership, :member, organization: @organization)
          sign_in membership.user

          assert_difference -> { OrganizationInvitation.count }, 2 do
            post organization_invitations_path(@organization.slug), params: { invitations: [{ email: "ron@example.com", role: "viewer" }, { email: "hermoine@example.com", role: "viewer" }] }

            assert_response :created
            assert_response_gen_schema
            assert_equal "viewer", json_response[0]["role"]
            assert_equal "ron@example.com", json_response[0]["email"]
            assert_equal "viewer", json_response[1]["role"]
            assert_equal "hermoine@example.com", json_response[1]["email"]
          end
        end

        test "does not create an invitation for an existing email" do
          create(:organization_invitation, email: @invitations[0][:email], organization: @organization)
          sign_in @user

          assert_difference -> { OrganizationInvitation.count }, 1 do
            post organization_invitations_path(@organization.slug), params: { invitations: @invitations }

            assert_response :created
          end
        end

        test "creates an invitation for a guest" do
          project = create(:project, organization: @organization)
          invitation_params = { email: "nick@campsite.com", role: "guest", project_ids: [project.public_id] }

          sign_in @user
          assert_difference -> { OrganizationInvitation.count }, 1 do
            post organization_invitations_path(@organization.slug), params: { invitations: [invitation_params] }
          end

          assert_response :created
          assert_response_gen_schema
          assert_equal "guest", json_response[0]["role"]
          assert_equal invitation_params[:email], json_response[0]["email"]
          assert_equal project.public_id, json_response[0]["projects"][0]["id"]
        end

        test "guest can't create an invitation" do
          project = create(:project, organization: @organization)
          invitation_params = { email: "nick@campsite.com", role: "guest", project_ids: [project.public_id] }
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          assert_no_difference -> { OrganizationInvitation.count } do
            post organization_invitations_path(@organization.slug), params: { invitations: [invitation_params] }

            assert_response :forbidden
          end
        end

        test "returns 422 for a missing param" do
          sign_in @user

          assert_no_difference -> { OrganizationInvitation.count } do
            post organization_invitations_path(@organization.slug), params: { invitations: [{ email: "ron@example.com" }] }

            assert_response :unprocessable_entity
            assert_equal "unrecognized Role", json_response["message"]
          end
        end

        test "422s for an invalid email address" do
          sign_in @user

          assert_no_difference -> { OrganizationInvitation.count } do
            post organization_invitations_path(@organization.slug), params: { invitations: [{ email: "ron@example", role: "viewer" }] }

            assert_response :unprocessable_entity
            assert_equal "Email is invalid", json_response["message"]
          end
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          post organization_invitations_path(@organization.slug), params: { invitations: @invitations }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organization_invitations_path(@organization.slug), params: { invitations: @invitations }
          assert_response :unauthorized
        end

        test "returns 403 when member invites admins" do
          member = create(:organization_membership, :member, organization: @organization)

          sign_in member.user

          assert_no_difference -> { OrganizationInvitation.count } do
            post organization_invitations_path(@organization.slug), params: { invitations: [{ email: "ron@example.com", role: "admin" }] }

            assert_response :forbidden
          end
        end

        test "member can invite member" do
          member = create(:organization_membership, :member, organization: @organization)

          sign_in member.user

          assert_difference -> { OrganizationInvitation.count }, 1 do
            post organization_invitations_path(@organization.slug), params: { invitations: [{ email: "ron@example.com", role: "member" }] }
          end

          assert_response :created
          assert_response_gen_schema
        end
      end

      context "#show" do
        setup do
          @invitation = create(:organization_invitation, :with_recipient, organization: @organization)
        end

        test "returns an invitation with org info" do
          sign_in @user

          get organization_invitation_path(@organization.slug, @invitation.invite_token)

          assert_response :ok
          assert_response_gen_schema
          assert_predicate json_response["organization"], :present?
        end

        test "return 404 for an invalid token" do
          sign_in @user
          get organization_invitation_path(@organization.slug, "invalid")
          assert_response :not_found
        end

        test "return 401 for an unauthenticated user" do
          get organization_invitation_path(@organization.slug, @invitation.invite_token)
          assert_response :unauthorized
        end
      end

      context "#accept" do
        setup do
          @invitation = create(:organization_invitation, :with_recipient, organization: @organization)
        end

        test "accepts the invitation" do
          sign_in @invitation.recipient
          post accept_invitation_by_token_path(@invitation.invite_token)

          assert_response :created
          assert_response_gen_schema
          assert_equal @organization.path, json_response["redirect_path"]
          member = @organization.memberships.find_by!(user_id: @invitation.recipient.id)
          assert_equal "admin", member.role_name
        end

        test "accepts a guest invitation" do
          sender = create(:organization_membership, organization: @organization).user
          project = create(:project, organization: @organization)
          invitation = create(:organization_invitation, :with_recipient, sender: sender, organization: @organization, role: "guest", organization_invitation_projects_attributes: [{ project_id: project.id }])

          sign_in invitation.recipient
          assert_difference -> { OrganizationMembership.count }, 1 do
            post accept_invitation_by_token_path(invitation.invite_token)
          end

          assert_response :created
          assert_response_gen_schema
          assert_equal project.path, json_response["redirect_path"]
          member = @organization.memberships.find_by!(user_id: invitation.recipient.id)
          assert_equal "guest", member.role_name
          permission = invitation.recipient.kept_permissions.find_by!(subject: project)
          assert_equal "view", permission.action
          project_memberships = project.project_memberships.where(organization_membership: member)
          assert_equal 1, project_memberships.count
          project_membership = project_memberships.first!
          event = project_membership.events.created_action.first
          event.process!
          notification = event.notifications.first!
          assert_equal "#{sender.display_name} added you to #{project.name}", notification.summary_text
        end

        test "accepts a guest invitation with no project access" do
          sender = create(:organization_membership, organization: @organization).user
          invitation = create(:organization_invitation, :with_recipient, sender: sender, organization: @organization, role: "guest", organization_invitation_projects_attributes: [])
          create(:project, organization: @organization, is_default: true)
          create(:integration, :campsite, owner: @organization)

          sign_in invitation.recipient
          assert_difference -> { OrganizationMembership.count }, 1 do
            post accept_invitation_by_token_path(invitation.invite_token)
          end

          assert_response :created
          assert_response_gen_schema
          assert_equal @organization.path, json_response["redirect_path"]
          member = @organization.memberships.find_by!(user_id: invitation.recipient.id)
          assert_equal "guest", member.role_name
          assert_predicate member.project_memberships, :none?
        end

        test "returns an error for expired invitation" do
          @invitation.update!(expires_at: 1.hour.ago)
          assert_predicate @invitation, :expired?

          sign_in @invitation.recipient
          post organization_accept_invitation_path(@organization.slug, @invitation.public_id), params: { invite_token: @invitation.invite_token }

          assert_response :unprocessable_entity
          assert_equal "The invitation has expired", json_response["message"]
        end

        test "return 404 for an invalid token" do
          sign_in @invitation.recipient
          post organization_accept_invitation_path(@organization.slug, @invitation.public_id), params: { invite_token: "invalid-token" }
          assert_response :not_found
        end

        test "return 404 for a random user" do
          sign_in create(:user)
          post organization_accept_invitation_path(@organization.slug, @invitation.public_id)
          assert_response :not_found
        end

        test "return 403 for a user without a confirmed email" do
          @user = create(:user, :unconfirmed)
          @invitation = create(:organization_invitation, email: @user.email, organization: @organization)

          sign_in @user
          post organization_accept_invitation_path(@organization.slug, @invitation.public_id), params: { invite_token: @invitation.invite_token }
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organization_accept_invitation_path(@organization.slug, @invitation.public_id)
          assert_response :unauthorized
        end
      end

      context "#destroy" do
        setup do
          @invitation = create(:organization_invitation, organization: @organization)
        end

        test "works for an admin" do
          sign_in @user
          delete organization_invitation_path(@organization.slug, @invitation.public_id)
          assert_response :no_content

          assert_nil OrganizationInvitation.find_by(id: @invitation.id)
        end

        test "works for a member" do
          member = create(:organization_membership, :member, organization: @organization).user

          sign_in member
          delete organization_invitation_path(@organization.slug, @invitation.public_id)
          assert_response :no_content

          assert_nil OrganizationInvitation.find_by(id: @invitation.id)
        end

        test "guest can't destroy an invitation" do
          guest_member = create(:organization_membership, :guest, organization: @organization)

          sign_in guest_member.user
          delete organization_invitation_path(@organization.slug, @invitation.public_id)

          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_invitation_path(@organization.slug, @invitation.public_id)
          assert_response :unauthorized
        end
      end
    end
  end
end
