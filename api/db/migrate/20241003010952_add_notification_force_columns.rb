class AddNotificationForceColumns < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :notifications_paused_at, :datetime
    add_column :message_threads, :notification_forced_at, :datetime
  end
end
