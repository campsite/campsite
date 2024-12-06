# frozen_string_literal: true

module Api
  module V1
    module Organizations
      class BulkInvitesController < BaseController
        rescue_from Role::RoleNotFoundError, with: :render_unprocessable_entity

        extend Apigen::Controller

        response model: OrganizationInvitationSerializer, is_array: true, code: 201
        request_params do
          {
            comma_separated_emails: { type: :string },
            project_id: { type: :string, required: false },
          }
        end
        def create
          authorize(current_organization, :invite_member?)

          invitations = current_organization.bulk_invite_members(
            sender: current_user,
            comma_separated_emails: params[:comma_separated_emails],
            project_id: params[:project_id],
          )

          render_json(OrganizationInvitationSerializer, invitations, { status: :created })
        end
      end
    end
  end
end
