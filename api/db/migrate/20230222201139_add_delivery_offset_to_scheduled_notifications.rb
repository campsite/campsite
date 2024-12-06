class AddDeliveryOffsetToScheduledNotifications < ActiveRecord::Migration[7.0]
  def change
    add_column :scheduled_notifications, :delivery_offset, :integer
  end
end
