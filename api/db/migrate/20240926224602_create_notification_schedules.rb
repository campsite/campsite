class CreateNotificationSchedules < ActiveRecord::Migration[7.2]
  def change
    create_table :notification_schedules, id: { type: :bigint, unsigned: :true } do |t|
      t.references :user, unsigned: true, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.datetime :last_applied_at
      t.boolean :monday, null: false, default: true
      t.boolean :tuesday, null: false, default: true
      t.boolean :wednesday, null: false, default: true
      t.boolean :thursday, null: false, default: true
      t.boolean :friday, null: false, default: true
      t.boolean :saturday, null: false, default: true
      t.boolean :sunday, null: false, default: true

      t.timestamps
    end

    add_index :notification_schedules, :last_applied_at
    add_index :notification_schedules, :end_time
    add_index :notification_schedules, :monday
    add_index :notification_schedules, :tuesday
    add_index :notification_schedules, :wednesday
    add_index :notification_schedules, :thursday
    add_index :notification_schedules, :friday
    add_index :notification_schedules, :saturday
    add_index :notification_schedules, :sunday
  end
end
