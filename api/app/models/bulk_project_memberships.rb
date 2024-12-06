# frozen_string_literal: true

class BulkProjectMemberships
  include ActiveModel::Model

  attr_accessor :project, :creator_user, :member_user_public_ids, :add_everyone

  validate :cannot_add_everyone_to_private_project

  def create!
    validate!

    organization_memberships = project.organization.kept_memberships.includes(:user).where(users: { public_id: user_public_ids })
    organization_memberships.each do |organization_membership|
      project.add_member!(organization_membership)
    end
  end

  private

  def user_public_ids
    return @user_public_ids if defined?(@user_public_ids)

    @user_public_ids = if add_everyone
      [creator_user.public_id, project.organization.non_guest_members.pluck(:public_id)].flatten.uniq
    else
      [creator_user.public_id, member_user_public_ids].flatten.uniq.compact
    end
  end

  def cannot_add_everyone_to_private_project
    if project.private? && add_everyone
      errors.add(:base, "Cannot add everyone to a private project")
    end
  end
end
