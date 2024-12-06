class AddMembersCountToProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :projects, :members_count, :integer, default: 0, null: false
  end
end
