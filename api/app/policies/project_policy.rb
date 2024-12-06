# frozen_string_literal: true

class ProjectPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if actor.organization_scope?
        scope.viewable_by_api_actor(actor)
      else
        scope.viewable_by(user)
      end
    end
  end

  def show?
    return false unless org_member? || org_token?

    project_member? || project_integration? || (can_view_all_projects? && !@record.private?)
  end

  def list_posts?
    show?
  end

  def list_notes?
    show?
  end

  def update?
    confirmed_user? && show? &&
      organization_membership.role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::UPDATE_ANY_ACTION)
  end

  def update_default?
    confirmed_user? && org_admin? && show?
  end

  def destroy?
    confirmed_user? && show? && !@record.is_general? &&
      organization_membership.role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::DESTROY_ANY_ACTION)
  end

  def create_post?
    confirmed_user? && show?
  end

  def subscribe?
    confirmed_user? && show?
  end

  def unsubscribe?
    confirmed_user? && show?
  end

  def archive?
    confirmed_user? && show? && !@record.is_general? &&
      organization_membership.role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::ARCHIVE_ANY_ACTION)
  end

  def unarchive?
    confirmed_user? && show? &&
      organization_membership.role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::UNARCHIVE_ANY_ACTION)
  end

  def create_favorite?
    confirmed_user? && show?
  end

  def remove_favorite?
    confirmed_user? && show?
  end

  def list_project_memberships?
    confirmed_user? && show?
  end

  def list_addable_members?
    confirmed_user? && update?
  end

  def create_project_membership?
    confirmed_user? && update?
  end

  def remove_project_membership?
    confirmed_user? && update?
  end

  def manage_integrations?
    confirmed_user? && update?
  end

  def list_pins?
    show?
  end

  def create_pin?
    confirmed_user? && show?
  end

  def remove_pin?
    confirmed_user? && show?
  end

  def show_invitation_url?
    confirmed_user? && show? && organization_membership.role_has_permission?(resource: Role::INVITATION_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def reset_invitation_url?
    confirmed_user? && show? && organization_membership.role_has_permission?(resource: Role::INVITATION_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def create_read?
    confirmed_user? && show?
  end

  def mark_unread?
    confirmed_user? && show?
  end

  def export?
    confirmed_user? && show?
  end

  private

  def org_admin?
    @record.organization.admin?(@user)
  end

  def org_member?
    organization_membership.present?
  end

  def org_token?
    @actor.organization_scope? && @record.organization == @actor.organization
  end

  def organization_membership
    return false unless @user

    @record.organization.kept_memberships.find_by(user_id: @user.id)
  end

  def project_member?
    return false unless organization_membership

    @record.kept_project_memberships.exists?(organization_membership: organization_membership)
  end

  def project_integration?
    return false unless @actor.application

    @record.kept_oauth_applications.exists?(id: @actor.application.id)
  end

  def can_view_all_projects?
    return true if org_token?

    return false unless organization_membership

    organization_membership.role.has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::VIEW_ANY_ACTION)
  end
end
