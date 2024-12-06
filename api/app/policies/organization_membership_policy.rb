# frozen_string_literal: true

class OrganizationMembershipPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return @scope.all if @actor.organization_scope?

      scope = @scope.joins(:organization).left_outer_joins(:kept_projects).where(organization: @user.organizations)

      scope.non_guest.or(
        scope.in_organization_where_guest_without_shared_project_viewable_by(@user).or(
          scope.sharing_project_with(@user).or(
            scope.where(user_id: @user.id),
          ),
        ),
      )
    end
  end

  def update_member_role?
    confirmed_user? && org_admin?
  end

  def bulk_update_project_memberships?
    confirmed_user? && org_admin?
  end

  def show?
    confirmed_user? && org_member? &&
      (
        !@record.guest? ||
        organization_membership.can_view_guest_without_shared_project? ||
        @record.sharing_project_with?(organization_membership) ||
        @record.user == @user
      )
  end

  def export?
    confirmed_user? && @record.user == @user
  end

  def destroy_member?
    # an org admin or the org member should be
    # able to destroy their membership
    confirmed_user? && (org_admin? || @record.user == @user)
  end

  def set_status?
    confirmed_user? && @record.user == @user
  end

  def reorder?
    confirmed_user? && @record.user == @user
  end

  def set_last_viewed_posts_at?
    confirmed_user? && @record.user == @user
  end

  private

  def org_admin?
    @record.organization.admin?(@user)
  end

  def org_member?
    !!organization_membership
  end

  def organization_membership
    return @organization_membership if defined?(@organization_membership)

    @organization_membership = @record.organization.kept_memberships.find_by(user: @user)
  end
end
