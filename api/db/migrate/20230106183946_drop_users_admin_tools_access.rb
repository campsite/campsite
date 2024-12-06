class DropUsersAdminToolsAccess < ActiveRecord::Migration[7.0]
  def change
    remove_column :users, :admin_tools_access, :boolean, null: false, default: false
  end
end
