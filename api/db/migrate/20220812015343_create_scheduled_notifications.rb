class CreateScheduledNotifications < ActiveRecord::Migration[7.0]
  def change
    create_table :scheduled_notifications do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :name, null: false
      t.time       :delivery_time, null: false
      t.integer    :delivery_day, null: false
      t.string     :time_zone, null: false
      t.references :schedulable, polymorphic: true, null: false, unsigned: true

      t.timestamps
    end
  end
end
