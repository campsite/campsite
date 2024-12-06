class AddNotificationsInboxIndex < ActiveRecord::Migration[7.0]
  def change
    add_index :notifications, [:target_id, :target_type, :organization_membership_id, :discarded_at, :created_at], name: "index_notifications_for_recent_scope"
  end
end
