# frozen_string_literal: true

class OrganizationMembershipRequestPolicy < ApplicationPolicy
  def approve?
    confirmed_user? && org_admin?
  end

  def decline?
    confirmed_user? && org_admin?
  end

  private

  def org_admin?
    @record.organization.admin?(@user)
  end
end
