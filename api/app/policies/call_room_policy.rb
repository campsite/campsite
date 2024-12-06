# frozen_string_literal: true

class CallRoomPolicy < ApplicationPolicy
  def show?
    no_subject? || @record.personal? || subject_member?
  end

  def create_invitation?
    show?
  end

  private

  def no_subject?
    !@record.subject
  end

  def subject_member?
    return false unless @record.subject.respond_to?(:memberships)

    @record.subject.memberships.where(organization_membership: user&.organization_memberships).any?
  end
end
