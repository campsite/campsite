# frozen_string_literal: true

module Api
  module V1
    class OrganizationInvitationsController < BaseController
      skip_before_action :require_authenticated_organization_membership, only: [:accept, :destroy, :show]
      skip_before_action :require_org_two_factor_authentication, only: [:accept, :destroy, :show]

      rescue_from Role::RoleNotFoundError, with: :render_unprocessable_entity

      extend Apigen::Controller

      response model: OrganizationInvitationPageSerializer, code: 200
      request_params do
        {
          q: { type: :string, required: false },
          role_counted: { type: :boolean, required: false },
          after: { type: :string, required: false },
        }
      end
      def index
        authorize(current_organization, :list_invitations?)
        invitations = current_organization.invitations.includes(:sender, :recipient)

        if params[:q]
          invitations = invitations.search_by(params[:q])
        end

        if to_bool(params[:counted])
          invitations = invitations.role_counted
        end

        render_page(OrganizationInvitationPageSerializer, invitations, { order: :desc })
      end

      response model: OrganizationInvitationSerializer, code: 200
      def show
        organization = Organization.friendly.find(params[:org_slug])
        invitation = organization.invitations.find_by!(invite_token: params[:invite_token])

        render_json(OrganizationInvitationSerializer, invitation, { view: :with_organization })
      end

      response model: OrganizationInvitationSerializer, is_array: true, code: 201
      request_params do
        {
          invitations: {
            type: :object,
            is_array: true,
            properties: {
              email: { type: :string },
              role: { type: :string },
              project_ids: { type: :string, is_array: true, required: false },
            },
          },
          onboarding: { type: :boolean, required: false },
        }
      end
      def create
        authorize(current_organization, :invite_member?)
        authorize(current_organization, :invite_admin?) if params[:invitations].any? { |i| i[:role] == Role::ADMIN_NAME }
        authorize(current_organization, :invite_counted_member?) if params[:invitations].any? { |i| Role.by_name!(i[:role]).counted? }

        invitations = current_organization.invite_members(sender: current_user, invitations: params[:invitations])

        render_json(OrganizationInvitationSerializer, invitations, { status: :created })
      end

      response code: 201 do
        { redirect_path: { type: :string } }
      end

      def accept
        invitation = OrganizationInvitation.find_by!(invite_token: params[:invite_token])
        authorize(invitation, :accept?)
        organization = invitation.organization
        member = invitation.accept!(current_user)
        redirect_path = member.kept_projects.length == 1 ? member.kept_projects.first!.path(organization) : organization.path
        render(json: { redirect_path: redirect_path }, status: :created)
      rescue OrganizationInvitation::AcceptError => ex
        render_error(status: :unprocessable_entity, code: "unprocessable", message: ex.message)
      end

      response code: 204
      def destroy
        organization = Organization.friendly.find(params[:org_slug])
        invitation = organization.invitations.find_by!(public_id: params[:id])
        authorize(invitation, :destroy_invite?)
        invitation.destroy!
      end
    end
  end
end
