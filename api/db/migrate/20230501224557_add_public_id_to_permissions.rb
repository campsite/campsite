class AddPublicIdToPermissions < ActiveRecord::Migration[7.0]
  def change
    add_column :permissions, :public_id, :string, limit: 12
  end
end
