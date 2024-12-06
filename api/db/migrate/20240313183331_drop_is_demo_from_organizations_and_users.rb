class DropIsDemoFromOrganizationsAndUsers < ActiveRecord::Migration[7.1]
  def change
    remove_column :organizations, :is_demo, :boolean, default: false, null: false
    remove_column :users, :is_demo, :boolean, default: false, null: false
  end
end
