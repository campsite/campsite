# frozen_string_literal: true

class DropProjectMembershipsRemindable < ActiveRecord::Migration[7.0]
  def change
    remove_index(:project_memberships, [:remindable, :member_id])
    remove_index(:project_memberships, :remindable)
    remove_column(:project_memberships, :remindable, :boolean, default: true)
  end
end
