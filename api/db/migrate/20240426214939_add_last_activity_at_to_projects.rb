class AddLastActivityAtToProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :projects, :last_activity_at, :datetime
    add_index :projects, :last_activity_at
  end
end
