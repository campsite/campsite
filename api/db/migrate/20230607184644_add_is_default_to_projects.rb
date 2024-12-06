class AddIsDefaultToProjects < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :is_default, :boolean, defalult: false
    add_index :projects, :is_default
  end
end
