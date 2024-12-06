class ChangeScheduledNotificattionsDeliveryDayColumnNull < ActiveRecord::Migration[7.0]
  def change
    change_column_null(:scheduled_notifications, :delivery_day, true)
    add_index :scheduled_notifications, [:schedulable_type, :schedulable_id, :name],
      name: :idx_scheduled_notifications_on_schedulable_type_and_id_and_name
    add_index :scheduled_notifications, [:time_zone, :delivery_time, :delivery_day],
      name: :idx_scheduled_notifications_on_day_and_time_and_time_zone
  end
end
