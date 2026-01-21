class AddDiscordNotificationFields < ActiveRecord::Migration[7.1]
  def change
    # Add Discord message tracking to notifications
    add_column :notifications, :discord_message_id, :string
    add_index :notifications, :discord_message_id

    # Add Discord notification preferences to organization memberships
    add_column :organization_memberships, :discord_notifications_enabled, :boolean, default: false
    add_column :organization_memberships, :discord_user_id, :string
    
    # Add Discord notification channel to organizations
    add_column :organizations, :discord_notification_channel_id, :string
  end
end