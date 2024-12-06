class DropProjectMemberships < ActiveRecord::Migration[7.0]
  def change
    drop_table :project_memberships
  end
end
