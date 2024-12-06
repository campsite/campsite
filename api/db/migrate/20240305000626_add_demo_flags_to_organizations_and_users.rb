class AddDemoFlagsToOrganizationsAndUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :organizations, :is_demo, :boolean, default: false
    add_column :users, :is_demo, :boolean, default: false
  end
end
