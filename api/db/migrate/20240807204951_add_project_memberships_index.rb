class AddProjectMembershipsIndex < ActiveRecord::Migration[7.1]
  def change
    add_index :project_memberships, [:organization_membership_id, :project_id, :discarded_at]
  end
end
