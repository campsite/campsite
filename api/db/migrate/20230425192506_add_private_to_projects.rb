class AddPrivateToProjects < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :private, :boolean, null: false, default: false
    add_index :projects, :private
  end
end
