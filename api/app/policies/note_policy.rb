# frozen_string_literal: true

class NotePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.viewable_by(@user)
    end
  end

  def show?
    org_member? && viewer?
  end

  def update?
    confirmed_user? && editor?
  end

  def sync?
    confirmed_user? && viewer?
  end

  def destroy?
    confirmed_user? && (note_user? || org_admin?)
  end

  def create_reaction?
    confirmed_user? && viewer?
  end

  def create_comment?
    confirmed_user? && viewer?
  end

  def create_follow_up?
    confirmed_user? && viewer?
  end

  def list_comments?
    confirmed_user? && viewer?
  end

  def list_permissions?
    confirmed_user? && viewer?
  end

  def create_permission?
    confirmed_user? && editor?
  end

  def update_permission?
    confirmed_user? && editor?
  end

  def update_visibility?
    confirmed_user? && editor?
  end

  def destroy_permission?
    confirmed_user? && editor?
  end

  def list_views?
    confirmed_user? && viewer?
  end

  def create_view?
    @record.public_visibility? || (confirmed_user? && viewer?)
  end

  def show_attachments?
    @record.public_visibility? || (org_member? && viewer?)
  end

  def share?
    show?
  end

  def create_favorite?
    org_member? && viewer?
  end

  def remove_favorite?
    org_member? && viewer?
  end

  def create_pin?
    org_member? && project? && viewer?
  end

  def list_timeline_events?
    confirmed_user? && viewer?
  end

  private

  def organization_membership
    @record.organization.kept_memberships.find_by(user_id: @user.id)
  end

  def project?
    @record.project.present?
  end

  def viewer?
    @record.project_viewer?(@user) || @record.viewer?(@user)
  end

  def editor?
    @record.project_editor?(@user) || @record.editor?(@user)
  end

  def org_admin?
    @record.organization.admin?(@user)
  end

  def org_member?
    @record.organization.member?(@user)
  end

  def note_user?
    @record.user == @user
  end
end
