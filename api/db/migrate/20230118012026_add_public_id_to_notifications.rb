class AddPublicIdToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_column :notifications, :public_id, :string, limit: 12, null: false
    add_index :notifications, :public_id, unique: true
  end
end
