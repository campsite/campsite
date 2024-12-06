class AddAdminToolsAccessToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :admin_tools_access, :boolean, null: false, default: false
  end
end
