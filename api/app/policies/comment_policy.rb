# frozen_string_literal: true

class CommentPolicy < ApplicationPolicy
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
    confirmed_user? && (org_member? || org_token?) && can_view_subject?
  end

  def update?
    confirmed_user? && org_member? && can_view_subject? && (comment_user? || (from_integration? && can_edit_integration_comment?))
  end

  def destroy?
    confirmed_user? && (org_admin? || (comment_user? && org_member?) || (from_integration? && can_destroy_integration_comment?)) && can_view_subject?
  end

  def create_reaction?
    confirmed_user? && org_member? && can_view_subject?
  end

  def create_follow_up?
    confirmed_user? && org_member? && can_view_subject?
  end

  def resolve?
    confirmed_user? && org_member? && can_view_subject?
  end

  def update_tasks?
    confirmed_user? && org_member? && can_view_subject?
  end

  def show_attachments?
    confirmed_user? && org_member? && can_view_subject?
  end

  def create_linear_issue?
    confirmed_user? && org_member? && can_view_subject? && organization_membership.role_has_permission?(resource: Role::ISSUE_RESOURCE, permission: Role::CREATE_ACTION)
  end

  private

  def organization_membership
    return unless @user
    return @organization_membership if defined?(@organization_membership)

    @organization_membership = @record.organization.kept_memberships.find_by(user_id: @user.id)
  end

  def org_admin?
    @record.organization.admin?(@user)
  end

  def org_member?
    !!organization_membership
  end

  def org_token?
    actor.organization_scope? && @record.organization == @actor.organization
  end

  def comment_user?
    @record.user == @user
  end

  def can_view_subject?
    Pundit.policy(@actor, @record.subject).show?
  end

  def from_integration?
    (@record.oauth_application.present? || @record.integration.present?) && !@record.user
  end

  def can_edit_integration_comment?
    organization_membership.role_has_permission?(resource: Role::COMMENT_RESOURCE, permission: Role::EDIT_INTEGRATION_CONTENT_ACTION)
  end

  def can_destroy_integration_comment?
    organization_membership.role_has_permission?(resource: Role::COMMENT_RESOURCE, permission: Role::DESTROY_INTEGRATION_CONTENT_ACTION)
  end
end
