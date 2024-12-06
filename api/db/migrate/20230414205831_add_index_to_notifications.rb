class AddIndexToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_index :notifications, [:organization_membership_id, :discarded_at], name: :idx_notifs_on_org_membership_id_and_discarded_at
  end
end
