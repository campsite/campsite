class AddUnreadNotificationsIndex < ActiveRecord::Migration[7.0]
  def change
    add_index :notifications, [:organization_membership_id, :discarded_at, :read_at], name: "index_notifications_on_member_and_discarded_at_and_read_at"
  end
end
