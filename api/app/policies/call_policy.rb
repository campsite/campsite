# frozen_string_literal: true

class CallPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.viewable_by(user)
    end
  end

  def update?
    editor?
  end

  def show?
    viewer?
  end

  def list_recordings?
    viewer?
  end

  def destroy_all_recordings?
    editor?
  end

  def update_permission?
    editor?
  end

  def destroy_permission?
    editor?
  end

  def create_pin?
    org_member? && project? && viewer?
  end

  def create_favorite?
    org_member? && viewer?
  end

  def remove_favorite?
    org_member? && viewer?
  end

  def create_follow_up?
    org_member? && viewer?
  end

  private

  def org_member?
    @record.organization.member?(@user)
  end

  def project?
    @record.project.present?
  end

  def call_participant?
    @record.peers.where(organization_membership: user.organization_memberships).any?
  end

  def subject_member?
    return false unless @record.room.subject.respond_to?(:memberships)

    @record.room.subject.memberships.where(organization_membership: user.organization_memberships).any?
  end

  def viewer?
    call_participant? || subject_member? || @record.project_viewer?(user)
  end

  def editor?
    call_participant? || @record.project_editor?(user)
  end
end
