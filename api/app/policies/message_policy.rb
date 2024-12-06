# frozen_string_literal: true

class MessagePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope
    end
  end

  def show?
    thread_member? || can_see_project?
  end

  def react?
    show?
  end

  def update?
    record.sender == current_organization_membership || current_organization_membership.admin?
  end

  def destroy?
    update?
  end

  def show_attachments?
    show?
  end

  private

  def current_organization_membership
    record.organization.kept_memberships.find_by(user: user)
  end

  def current_oauth_application
    record.message_thread.oauth_applications.find_by(id: @actor.application&.id)
  end

  def thread_member?
    record.message_thread.organization_memberships.find_by(user: user).present? || current_oauth_application.present?
  end

  def project
    record.message_thread.project
  end

  def can_see_project?
    project && Pundit.policy!(@actor, project).show?
  end
end
