# frozen_string_literal: true

class OrganizationInvitationPolicy < ApplicationPolicy
  def destroy_invite?
    # an org member or the recipient of an invitation should be
    # able to destroy the invitation
    confirmed_user? && (
      organization_membership&.role_has_permission?(resource: Role::INVITATION_RESOURCE, permission: Role::DESTROY_ANY_ACTION) ||
      @record.email == @user.email
    )
  end

  def accept?
    confirmed_user?
  end

  private

  def org_admin?
    @record.organization.admin?(@user)
  end

  def organization_membership
    @record.organization.kept_memberships.find_by!(user_id: @user.id)
  end
end
