class AddProjectMembersCountToProject < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :project_members_count, :integer, null: false, default: 0
  end
end
