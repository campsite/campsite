# frozen_string_literal: true

class PostPolicy < ApplicationPolicy
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
    @record.public_visibility? || ((org_member? || org_token?) && can_view_project? && can_view_state?)
  end

  def update?
    confirmed_user? && (org_admin? || post_user? || (from_integration? && can_edit_integration_content?)) && can_view_project?
  end

  def sync?
    confirmed_user? && org_member? && can_view_project?
  end

  def destroy?
    confirmed_user? && (org_admin? || post_user? || (from_integration? && can_destroy_integration_content?)) && can_view_project?
  end

  def publish?
    confirmed_user? && post_user? && can_view_project?
  end

  def create_link?
    confirmed_user? && post_user? && can_view_project?
  end

  def destroy_link?
    confirmed_user? && post_user? && can_view_project?
  end

  def create_reaction?
    confirmed_user? && org_member? && show?
  end

  def create_poll?
    confirmed_user? && (org_admin? || post_user?) && can_view_project?
  end

  def update_poll?
    confirmed_user? && (org_admin? || post_user?) && can_view_project?
  end

  def create_poll_vote?
    confirmed_user? && org_member? && show?
  end

  def create_view?
    @record.public_visibility? || (confirmed_user? && org_member? && can_view_project?)
  end

  def create_comment?
    confirmed_user? && (org_member? || org_token?) && show?
  end

  def create_version?
    confirmed_user? && post_user? && can_view_project?
  end

  def list_comments?
    @record.public_visibility? || (confirmed_user? && (org_member? || org_token?) && can_view_project?)
  end

  def subscribe?
    confirmed_user? && org_member? && show?
  end

  def unsubscribe?
    confirmed_user? && org_member? && show?
  end

  def create_feedback_request?
    confirmed_user? && post_user? && can_view_project?
  end

  def destroy_feedback_request?
    confirmed_user? && post_user? && can_view_project?
  end

  def share?
    confirmed_user? && org_member? && can_view_project?
  end

  def modify_visibility?
    confirmed_user? && org_member? && can_view_project?
  end

  def create_favorite?
    confirmed_user? && org_member? && show?
  end

  def remove_favorite?
    confirmed_user? && org_member? && show?
  end

  def create_pin?
    confirmed_user? && org_member? && can_view_project?
  end

  def update_tasks?
    confirmed_user? && org_member? && show?
  end

  def show_attachments?
    @record.public_visibility? || (org_member? && show?)
  end

  def create_follow_up?
    confirmed_user? && org_member? && show?
  end

  def create_linear_issue?
    confirmed_user? && org_member? && show? && organization_membership.role_has_permission?(resource: Role::ISSUE_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def resolve?
    confirmed_user? && show? && (organization_membership&.role_has_permission?(resource: Role::POST_RESOURCE, permission: Role::RESOLVE_ANY_ACTION) || org_token?)
  end

  def list_timeline_events?
    confirmed_user? && org_member? && can_view_project?
  end

  private

  def org_admin?
    organization_membership&.role_name == Role::ADMIN_NAME
  end

  def org_member?
    !!organization_membership
  end

  def org_token?
    actor.organization_scope? && @record.organization == @actor.organization
  end

  def organization_membership
    return unless @user
    return @organization_membership if defined?(@organization_membership)

    @organization_membership = @user.kept_organization_memberships.find_by(organization: @record.organization)
  end

  def post_user?
    @record.user == @user
  end

  def can_view_project?
    project = @record.project
    return true if (!project || !project.private?) && can_view_all_projects?
    return false unless project

    project.kept_project_memberships.exists?(organization_membership: organization_membership)
  end

  def can_view_all_projects?
    return true if actor.organization_scope?
    return false unless organization_membership

    organization_membership.role.has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::VIEW_ANY_ACTION)
  end

  def can_view_state?
    return true if @record.published?

    @record.user == @user
  end

  def from_integration?
    !!@record.integration || !!@record.oauth_application
  end

  def can_edit_integration_content?
    organization_membership&.role_has_permission?(resource: Role::POST_RESOURCE, permission: Role::EDIT_INTEGRATION_CONTENT_ACTION)
  end

  def can_destroy_integration_content?
    organization_membership&.role_has_permission?(resource: Role::POST_RESOURCE, permission: Role::DESTROY_INTEGRATION_CONTENT_ACTION)
  end
end
