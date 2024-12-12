# frozen_string_literal: true

module Api
  module V1
    module Organizations
      class VerifiedDomainMembershipsController < BaseController
        skip_before_action :require_authenticated_organization_membership, only: [:create]
        skip_before_action :require_org_two_factor_authentication, only: [:create]

        extend Apigen::Controller

        response model: OrganizationMemberSerializer, code: 201
        def create
          authorize(current_organization, :join_via_verified_domain?)

          new_member = current_organization.join(
            user: current_user,
            confirmed: true,
            role_name: Role::MEMBER_NAME,
            notify_admins_source: :verified_domain,
          )

          if new_member
            render_json(OrganizationMemberSerializer, new_member, { status: :created })
          else
            render_error(status: :unprocessable_entity, code: :unprocessable, message: "User is already a member of this organization.")
          end
        end
      end
    end
  end
end
