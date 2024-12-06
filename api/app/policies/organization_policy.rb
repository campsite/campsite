# frozen_string_literal: true

class OrganizationPolicy < ApplicationPolicy
  def invite_member?
    confirmed_user? && org_member? && organization_membership.role_has_permission?(resource: Role::INVITATION_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def invite_admin?
    invite_member? && organization_membership.role_has_permission?(resource: Role::ADMIN_INVITATION_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def invite_counted_member?
    invite_member? &&
      organization_membership.role_has_permission?(resource: Role::COUNTED_MEMBER_INVITATION_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def list_members?
    org_member? || org_token?
  end

  def list_invitations?
    org_member? && organization_membership.role_has_permission?(resource: Role::INVITATION_RESOURCE, permission: Role::VIEW_ANY_ACTION)
  end

  def list_tags?
    org_member?
  end

  def list_projects?
    org_member? || org_token?
  end

  def list_membership_requests?
    org_admin?
  end

  def list_digests?
    org_member?
  end

  def list_calls?
    org_member?
  end

  def search?
    list_tags? && list_projects? && list_posts? && list_digests? && list_members?
  end

  def create_tag?
    confirmed_user? && org_member? && organization_membership.role_has_permission?(resource: Role::TAG_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def create_project?
    confirmed_user? && org_member? && organization_membership.role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def create_post?
    confirmed_user? && (org_token? || (org_member? && organization_membership.role_has_permission?(resource: Role::POST_RESOURCE, permission: Role::CREATE_ACTION)))
  end

  def create_digest?
    confirmed_user? && org_member? && organization_membership.role_has_permission?(resource: Role::DIGEST_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def create_note?
    confirmed_user? && org_member? && organization_membership.role_has_permission?(resource: Role::NOTE_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def create_call_room?
    confirmed_user? && org_member? && organization_membership.role_has_permission?(resource: Role::CALL_ROOM_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def create_oauth_access_grant?
    confirmed_user? && org_member?
  end

  def list_posts?
    org_member? || org_token?
  end

  def list_notes?
    org_member?
  end

  def show_membership_request?
    confirmed_user?
  end

  def create_membership_request?
    confirmed_user?
  end

  def show?
    org_member?
  end

  def update?
    confirmed_user? && org_admin?
  end

  def destroy?
    confirmed_user? && org_admin?
  end

  def join?
    confirmed_user?
  end

  def join_via_verified_domain?
    confirmed_user? && @record.email_domain_matches?(@user)
  end

  def create_slack_integration?
    confirmed_user? && org_admin?
  end

  def show_slack_integration?
    org_member?
  end

  def destroy_slack_integration?
    confirmed_user? && org_admin?
  end

  def show_zapier_integration?
    confirmed_user? && org_admin?
  end

  def create_linear_integration?
    confirmed_user? && org_admin?
  end

  def show_linear_integration?
    org_member?
  end

  def destroy_linear_integration?
    confirmed_user? && org_admin?
  end

  def show_presigned_fields?
    confirmed_user? && org_member?
  end

  def update_sso?
    confirmed_user? && org_admin?
  end

  def manage_billing?
    confirmed_user? && org_admin?
  end

  def list_threads?
    org_member?
  end

  def create_thread?
    org_member? || org_token?
  end

  def create_attachments?
    confirmed_user? && org_member?
  end

  def show_attachments?
    org_member?
  end

  def list_custom_reactions?
    org_member?
  end

  def create_custom_reaction?
    confirmed_user? && org_member? && organization_membership.role_has_permission?(resource: Role::CUSTOM_REACTION_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def destroy_custom_reaction?
    confirmed_user? && org_member? && organization_membership.role_has_permission?(resource: Role::CUSTOM_REACTION_RESOURCE, permission: Role::DESTROY_ANY_ACTION)
  end

  def list_gifs?
    org_member?
  end

  def manage_integrations?
    confirmed_user? && org_member? && organization_membership.role_has_permission?(resource: Role::OAUTH_APPLICATION_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def export?
    confirmed_user? && org_admin?
  end

  private

  def org_admin?
    @record.admin?(@user)
  end

  def org_member?
    @record.members.include?(@user)
  end

  def org_token?
    @actor.organization_scope? && @record == @actor.organization
  end

  def organization_membership
    @record.kept_memberships.find_by!(user_id: @user.id)
  end
end
