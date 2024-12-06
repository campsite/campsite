class AddNotificationLevelToMessageThreadMemberships < ActiveRecord::Migration[7.1]
  def change
    add_column :message_thread_memberships, :notification_level, :integer, default: 0, null: false
  end
end
