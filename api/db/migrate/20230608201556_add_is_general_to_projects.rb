class AddIsGeneralToProjects < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :is_general, :boolean, default: false

    add_index :projects, :is_general
  end
end
