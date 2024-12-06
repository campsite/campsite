class AddTargetMemberIndexToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_index :notifications, [:target_type, :target_id, :organization_membership_id], name: "index_notifications_on_target_and_member"
  end
end
