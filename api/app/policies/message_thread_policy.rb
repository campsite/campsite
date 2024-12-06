# frozen_string_literal: true

class MessageThreadPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope
    end
  end

  def show?
    thread_member? || can_see_project?
  end

  def list_messages?
    show?
  end

  def create_message?
    show?
  end

  def create_read?
    thread_member?
  end

  def mark_unread?
    thread_member?
  end

  def update?
    thread_member? && @record.group?
  end

  def update_other_members?
    thread_member? && @record.group?
  end

  def leave?
    thread_member? && @record.group?
  end

  def create_favorite?
    thread_member?
  end

  def remove_favorite?
    thread_member?
  end

  def manage_integrations?
    thread_member? && thread_member.role_has_permission?(resource: Role::MESSAGE_THREAD_INTEGRATION_RESOURCE, permission: Role::CREATE_ACTION)
  end

  def destroy?
    thread_member? && organization_membership.role_has_permission?(resource: Role::MESSAGE_THREAD_RESOURCE, permission: Role::DESTROY_ANY_ACTION)
  end

  def force_notification?
    organization_membership && @record.viewer_can_force_notification?(organization_membership)
  end

  private

  def thread_member
    if @actor.application
      @record.oauth_applications.find_by(id: @actor.application.id)
    else
      @record.organization_memberships.find_by(user: @user)
    end
  end

  def thread_member?
    !!thread_member
  end

  def can_see_project?
    @record.project && Pundit.policy!(@actor, @record.project).show?
  end

  def organization_membership
    return false unless @user

    @record.organization.kept_memberships.find_by(user_id: @user.id)
  end
end
