class AddDemoToOrganizationAndUser < ActiveRecord::Migration[7.1]
  def change
    add_column :organizations, :demo, :boolean, default: false
    add_column :users, :demo, :boolean, default: false
  end
end
