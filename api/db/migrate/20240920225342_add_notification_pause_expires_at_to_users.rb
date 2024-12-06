class AddNotificationPauseExpiresAtToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :notification_pause_expires_at, :datetime
  end
end
