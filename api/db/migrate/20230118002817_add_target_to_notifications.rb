class AddTargetToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_reference :notifications, :target, polymorphic: true, null: false, unsigned: true
  end
end
